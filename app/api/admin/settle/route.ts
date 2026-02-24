import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
    try {
        const { matchId, eventId, actualResult } = await req.json();

        if ((!matchId && !eventId) || !actualResult) {
            return NextResponse.json({ error: 'Missing matchId/eventId or actualResult' }, { status: 400 });
        }

        if (actualResult !== 'HOME' && actualResult !== 'AWAY' && actualResult !== 'DRAW') {
            return NextResponse.json({ error: 'actualResult must be HOME, AWAY or DRAW' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Fetch matches to settle
            let matchesToSettle = [];

            if (eventId) {
                // Group settle by event ID
                matchesToSettle = await tx.betMatch.findMany({
                    where: {
                        status: 'ACTIVE',
                        offer: {
                            eventId: eventId
                        }
                    },
                    include: { offer: true }
                });
            } else if (matchId) {
                // Settle a single match (fallback/direct challenges)
                const match = await tx.betMatch.findUnique({
                    where: { id: matchId },
                    include: { offer: true }
                });
                if (match && match.status === 'ACTIVE') {
                    matchesToSettle.push(match);
                }
            }

            if (matchesToSettle.length === 0) {
                throw new Error('No active matches found to settle');
            }

            const settledMatches = [];

            // 2. Process each match
            for (const match of matchesToSettle) {
                const creatorSelection = match.offer.selection;
                const acceptorSelection = match.acceptorSelection ||
                    (creatorSelection === 'HOME' ? 'AWAY' : creatorSelection === 'AWAY' ? 'HOME' : 'DRAW');

                let winnerId = null;
                if (creatorSelection === actualResult) {
                    winnerId = match.creatorId;
                } else if (acceptorSelection === actualResult) {
                    winnerId = match.acceptorId;
                }

                if (!winnerId) {
                    // DRAW / Refund (Push)
                    const updatedMatch = await tx.betMatch.update({
                        where: { id: match.id },
                        data: {
                            status: 'SETTLED',
                            result: 'PUSH',
                            settledAt: new Date(),
                        }
                    });

                    // Refund Creator
                    const creator = await tx.user.findUnique({ where: { id: match.creatorId }, include: { wallet: true } });
                    if (creator?.wallet) {
                        await tx.wallet.update({
                            where: { id: creator.wallet.id },
                            data: { balance: { increment: match.creatorAmount } }
                        });
                        await tx.transaction.create({
                            data: {
                                userId: creator.id,
                                walletId: creator.wallet.id,
                                type: 'BET_RELEASE',
                                status: 'COMPLETED',
                                amount: match.creatorAmount,
                                matchId: match.id,
                                offerId: match.offerId,
                            }
                        });
                    }

                    // Refund Acceptor
                    const acceptor = await tx.user.findUnique({ where: { id: match.acceptorId }, include: { wallet: true } });
                    if (acceptor?.wallet) {
                        await tx.wallet.update({
                            where: { id: acceptor.wallet.id },
                            data: { balance: { increment: match.acceptorAmount } }
                        });
                        await tx.transaction.create({
                            data: {
                                userId: acceptor.id,
                                walletId: acceptor.wallet.id,
                                type: 'BET_RELEASE',
                                status: 'COMPLETED',
                                amount: match.acceptorAmount,
                                matchId: match.id,
                                offerId: match.offerId,
                            }
                        });
                    }
                    settledMatches.push(updatedMatch);
                    continue;
                }

                // Calculate totals for wins
                const totalPool = new Prisma.Decimal(match.creatorAmount).add(match.acceptorAmount);
                const feePercentage = new Prisma.Decimal(0.05); // 5% fee
                const platformFee = totalPool.mul(feePercentage);
                const payout = totalPool.sub(platformFee);

                // Update Match
                const updatedMatch = await tx.betMatch.update({
                    where: { id: match.id },
                    data: {
                        status: 'SETTLED',
                        winnerId: winnerId,
                        platformFeeTotal: platformFee,
                        result: winnerId === match.creatorId ? 'CREATOR_WIN' : 'ACCEPTOR_WIN',
                        settledAt: new Date(),
                    }
                });

                // Update Winner's Wallet
                const winner = await tx.user.findUnique({
                    where: { id: winnerId },
                    include: { wallet: true }
                });

                if (!winner || !winner.wallet) {
                    throw new Error(`Winner wallet not found for user ${winnerId}`);
                }

                await tx.wallet.update({
                    where: { id: winner.wallet.id },
                    data: { balance: { increment: payout } }
                });

                // Create Transaction for Payout
                await tx.transaction.create({
                    data: {
                        userId: winnerId,
                        walletId: winner.wallet.id,
                        type: 'BET_RELEASE',
                        status: 'COMPLETED',
                        amount: payout,
                        matchId: match.id,
                        offerId: match.offerId,
                    }
                });

                // Log Platform Fee
                await tx.transaction.create({
                    data: {
                        userId: winnerId,
                        walletId: winner.wallet.id,
                        type: 'PLATFORM_FEE',
                        status: 'COMPLETED',
                        amount: platformFee,
                        matchId: match.id,
                        offerId: match.offerId,
                    }
                });

                settledMatches.push(updatedMatch);
            }

            return settledMatches;
        }, {
            timeout: 10000 // Aumentamos el timeout para bulk settlement
        });

        return NextResponse.json({ success: true, settledCount: result.length });
    } catch (error: any) {
        console.error('Error settling match(es):', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
