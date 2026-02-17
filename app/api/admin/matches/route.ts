import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const activeMatches = await prisma.betMatch.findMany({
            where: { status: 'ACTIVE' },
            include: {
                creator: {
                    select: { id: true, name: true, code: true }
                },
                acceptor: {
                    select: { id: true, name: true, code: true }
                },
                offer: {
                    include: {
                        event: true
                    }
                }
            },
            orderBy: { offer: { createdAt: 'desc' } }
        });

        const formatted = activeMatches.map(match => ({
            id: match.id,
            createdAt: match.offer.createdAt,
            creator: match.creator,
            acceptor: match.acceptor,
            amount: match.creatorAmount, // Assuming equal match for now
            totalPool: Number(match.creatorAmount) + Number(match.acceptorAmount),
            eventName: match.offer.event
                ? `${match.offer.event.homeTeam} vs ${match.offer.event.awayTeam}`
                : 'Direct Challenge',
            selection: match.offer.selection,
            acceptorSelection: match.acceptorSelection
        }));

        return NextResponse.json({ matches: formatted });
    } catch (error) {
        console.error('Error fetching active matches:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
