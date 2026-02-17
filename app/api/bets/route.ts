import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const bodySchema = z.object({
  userId: z.string().min(1),
  eventId: z.string().min(1),
  selection: z.enum(['HOME', 'AWAY', 'DRAW']),
  amount: z.number().positive(),
  mode: z.enum(['direct', 'random']),
  opponentCode: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { userId, eventId, selection, amount, mode, opponentCode } =
    parsed.data;

  if (mode === 'direct' && !opponentCode) {
    return NextResponse.json(
      { error: 'Missing opponent code' },
      { status: 400 },
    );
  }

  const creator = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  });

  if (!creator || !creator.wallet) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const balance = Number(creator.wallet.balance);
  if (balance < amount) {
    return NextResponse.json(
      { error: 'Insufficient balance' },
      { status: 400 },
    );
  }

  const acceptor =
    mode === 'direct'
      ? await prisma.user.findUnique({ where: { code: opponentCode! } })
      : null;

  if (mode === 'direct' && !acceptor) {
    return NextResponse.json(
      { error: 'Opponent not found' },
      { status: 404 },
    );
  }

  const amountDecimal = new Prisma.Decimal(amount);
  const feeDecimal = new Prisma.Decimal(amount * 2 * 0.05);

  const result = await prisma.$transaction(async (tx) => {
    // Determine status: if direct, it stays OPEN until accepted.
    // If random, it stays OPEN until matched (though current code implies auto-match simulation for random, 
    // real logic would be OPEN. The original code simulated match for 'direct' too which we are changing).

    // For direct challenge, we do NOT auto-match here anymore.
    const isDirect = mode === 'direct';

    const offer = await tx.betOffer.create({
      data: {
        creatorId: creator.id,
        eventId,
        selection,
        amount: amountDecimal,
        // For direct, it's OPEN. For random, it's OPEN (waiting for someone to take it)
        status: 'OPEN',
        targetUserCode: isDirect ? opponentCode : undefined,
        isDirectChallenge: isDirect,
      },
    });

    // We no longer auto-create BetMatch for direct challenges here.
    // The opponent must accept it via the Challenge API.
    const match = null;

    const wallet = await tx.wallet.update({
      where: { id: creator.wallet!.id },
      data: { balance: { decrement: amountDecimal } },
    });

    await tx.transaction.create({
      data: {
        userId: creator.id,
        walletId: creator.wallet!.id,
        type: 'BET_LOCK',
        status: 'COMPLETED',
        amount: amountDecimal,
        offerId: offer.id,
        matchId: null,
      },
    });

    return { offer, match, wallet };
  });

  return NextResponse.json({
    offerId: result.offer.id,
    matchId: null,
    offerStatus: result.offer.status,
    balance: Number(result.wallet.balance),
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    // Fetch bets where user is creator
    const sentBets = await prisma.betOffer.findMany({
      where: { creatorId: userId },
      include: {
        event: true,
        match: {
          include: { acceptor: { select: { code: true, name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch bets where user is acceptor (via BetMatch)
    const receivedMatches = await prisma.betMatch.findMany({
      where: { acceptorId: userId },
      include: {
        offer: {
          include: {
            event: true,
            creator: { select: { code: true, name: true } }
          }
        }
      },
      orderBy: { offer: { createdAt: 'desc' } }
    });

    // Normalize to Bet type
    const bets = [
      ...sentBets.map(b => {
        let opponent = undefined;
        if (b.match?.id) {
          opponent = b.match.acceptor.name || b.match.acceptor.code;
        } else if (b.targetUserCode) {
          opponent = b.targetUserCode;
        }

        // Determine status based on match result
        let status = 'pending';
        if (b.status === 'MATCHED' && b.match) {
          // Check if match is settled
          if (b.match.status === 'SETTLED') {
            // User is the creator, check if they won
            status = b.match.winnerId === userId ? 'won' : 'lost';
          } else {
            status = 'matched';
          }
        } else if (b.status === 'OPEN') {
          status = 'pending';
        }

        return {
          id: b.id,
          matchId: b.eventId || 'direct',
          league: b.event?.leagueName || 'Reto Directo',
          homeTeam: b.event?.homeTeam || 'Retador',
          awayTeam: b.event?.awayTeam || 'Tu',
          date: b.createdAt.toISOString().split('T')[0],
          status: status,
          prediction: b.selection,
          amount: Number(b.amount),
          mode: b.isDirectChallenge ? 'direct' : 'random',
          opponent: opponent,
          selection: b.selection
        };
      }),
      ...receivedMatches.map(m => {
        // Determine status for acceptor
        let status = 'matched';
        if (m.status === 'SETTLED') {
          // User is the acceptor, check if they won
          status = m.winnerId === userId ? 'won' : 'lost';
        }

        return {
          id: m.offer.id,
          matchId: m.offer.eventId || 'direct',
          league: m.offer.event?.leagueName || 'Reto Directo',
          homeTeam: m.offer.event?.homeTeam || 'Tu',
          awayTeam: m.offer.event?.awayTeam || 'Retador',
          date: m.offer.createdAt.toISOString().split('T')[0],
          status: status,
          prediction: m.acceptorSelection || (m.offer.selection === 'HOME' ? 'AWAY' : 'HOME'),
          amount: Number(m.acceptorAmount),
          mode: m.offer.isDirectChallenge ? 'direct' : 'random',
          opponent: m.offer.creator.name || m.offer.creator.code,
          selection: m.acceptorSelection || (m.offer.selection === 'HOME' ? 'AWAY' : m.offer.selection === 'AWAY' ? 'HOME' : 'DRAW')
        };
      })
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ bets });
  } catch (error) {
    console.error('Error fetching bets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
