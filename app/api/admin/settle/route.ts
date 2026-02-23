import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
    try {
        const { matchId, actualResult } = await req.json();

        if (!matchId || !actualResult) {
            return NextResponse.json({ error: 'Missing matchId or actualResult' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Fetch the match
            const match = await tx.betMatch.findUnique({
                where: { id: matchId },
                include: { offer: true }
            });

            if (!match) {
                throw new Error('Match not found');
            }

            if (match.status !== 'ACTIVE') {
                throw new Error('Match is not active');
            }

            if (actualResult !== 'HOME' && actualResult !== 'AWAY' && actualResult !== 'DRAW') {
                throw new Error('actualResult must be HOME, AWAY or DRAW');
            }

            const creatorSelection = match.offer.selection;
            const acceptorSelection = match.acceptorSelection ||
                (creatorSelection === 'HOME' ? 'AWAY' : creatorSelection === 'AWAY' ? 'HOME' : 'DRAW');

            let winnerId = null;
            if (creatorSelection === actualResult) {
                winnerId = match.creatorId;
            } else if (acceptorSelection === actualResult) {
                winnerId = match.acceptorId;
            }

            // 2. Handle DRAW / Refund (Push)
            if (!winnerId) {
                const updatedMatch = await tx.betMatch.update({
                    where: { id: matchId },
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
                return updatedMatch;
            }

            // 3. Calculate totals for wins
            const totalPool = new Prisma.Decimal(match.creatorAmount).add(match.acceptorAmount);
            const feePercentage = new Prisma.Decimal(0.05); // 5% fee
            const platformFee = totalPool.mul(feePercentage);
            const payout = totalPool.sub(platformFee);

            // 3. Update Match
            const updatedMatch = await tx.betMatch.update({
                where: { id: matchId },
                data: {
                    status: 'SETTLED',
                    winnerId: winnerId,
                    platformFeeTotal: platformFee,
                    result: winnerId === match.creatorId ? 'CREATOR_WIN' : 'ACCEPTOR_WIN',
                    settledAt: new Date(),
                }
            });

            // 4. Update Winner's Wallet
            const winner = await tx.user.findUnique({
                where: { id: winnerId },
                include: { wallet: true }
            });

            if (!winner || !winner.wallet) {
                throw new Error('Winner wallet not found');
            }

            await tx.wallet.update({
                where: { id: winner.wallet.id },
                data: { balance: { increment: payout } }
            });

            // 5. Create Transaction for Payout
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

            // 6. Log Platform Fee (Optional, associating with system or just recording it linked to match)
            // Since we don't have a system user, we can associate it with the winner or just leave userId null if schema allows,
            // but schema requires userId. We can attribute it to the winner as a "fee paid" or just skip creating a Transaction for fee 
            // if it complicates the user's ledger.
            // Let's record it for the winner to show why they didn't get the full amount if they look at logs.
            await tx.transaction.create({
                data: {
                    userId: winnerId,
                    walletId: winner.wallet.id,
                    type: 'PLATFORM_FEE',
                    status: 'COMPLETED',
                    amount: platformFee, // This is just a record, the balance was already net of this. 
                    // Actually, if we want to show it as a deduction, we should have credited full amount then deducted. 
                    // But we credited net. So this transaction should probably just be informational. 
                    // Let's create it as a separate record that doesn't affect balance logic here (since we did increment(payout)).
                    matchId: match.id,
                    offerId: match.offerId,
                }
            });

            return updatedMatch;
        });

        return NextResponse.json({ success: true, match: result });
    } catch (error: any) {
        console.error('Error settling match:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
