import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // data: { fromUser, toUserCode, amount, message }

    if (!data.fromUser || !data.toUserCode || !data.amount) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Verify creator exists and get their ID (fromUser is likely the ID or we need to find them)
    // Assuming 'fromUser' in the payload is the user's ID as per most auth contexts

    const creator = await prisma.user.findUnique({
      where: { id: data.fromUser }
    });

    if (!creator) {
      // Fallback if fromUser was passed as code or something else, but ideally it is ID
      // If fromUser is a code, find by code
      const creatorByCode = await prisma.user.findUnique({ where: { code: data.fromUser } });
      if (!creatorByCode) return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
      data.fromUser = creatorByCode.id;
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { code: data.toUserCode }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    if (targetUser.id === data.fromUser) {
      return NextResponse.json({ error: 'Cannot challenge yourself' }, { status: 400 });
    }

    const challenge = await prisma.betOffer.create({
      data: {
        creatorId: data.fromUser,
        targetUserCode: data.toUserCode,
        isDirectChallenge: true,
        amount: data.amount,
        selection: 'Direct Challenge', // Placeholder
        message: data.message || '',
        status: 'OPEN',
      }
    });

    return NextResponse.json({ success: true, challenge });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Query: ?userCode=PB-1234-HN
  const { searchParams } = new URL(req.url);
  const userCode = searchParams.get('userCode');

  if (!userCode) {
    return NextResponse.json({ error: 'Missing userCode' }, { status: 400 });
  }

  try {
    const challenges = await prisma.betOffer.findMany({
      where: {
        targetUserCode: userCode,
        status: 'OPEN',
        isDirectChallenge: true
      },
      include: {
        creator: {
          select: { name: true, code: true }
        },
        event: {
          select: { homeTeam: true, awayTeam: true, leagueName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform for frontend if necessary, or just return
    const formatted = challenges.map(c => ({
      id: c.id,
      fromUser: c.creator.name || c.creator.code,
      toUserCode: c.targetUserCode,
      amount: Number(c.amount),
      message: c.message,
      status: 'pending', // mapped from OPEN
      createdAt: c.createdAt.getTime(),
      selection: c.selection, // Add selection
      eventName: c.event ? `${c.event.homeTeam} vs ${c.event.awayTeam}` : 'General Bet', // Add event name
      league: c.event?.leagueName // Add league
    }));

    return NextResponse.json({ challenges: formatted });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();
    // data: { id, action: 'accept' | 'reject' }

    if (!data.id || !['accept', 'reject'].includes(data.action)) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const offer = await prisma.betOffer.findUnique({
      where: { id: data.id },
      include: { creator: true }
    });

    if (!offer) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    if (offer.status !== 'OPEN') {
      return NextResponse.json({ error: 'Challenge is no longer open' }, { status: 400 });
    }

    if (data.action === 'reject') {
      const updated = await prisma.betOffer.update({
        where: { id: data.id },
        data: { status: 'CANCELED' }
      });
      return NextResponse.json({ success: true, challenge: updated });
    }

    const { acceptorSelection } = data;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get Acceptor with Wallet
      const acceptor = await tx.user.findUnique({
        where: { code: offer.targetUserCode! },
        include: { wallet: true }
      });

      if (!acceptor || !acceptor.wallet) {
        throw new Error('Acceptor user or wallet not found');
      }

      // 2. Check Balance
      const betAmount = new Prisma.Decimal(offer.amount);
      if (acceptor.wallet.balance.lessThan(betAmount)) {
        throw new Error('Insufficient balance');
      }

      // 3. Deduct from Wallet
      await tx.wallet.update({
        where: { id: acceptor.wallet.id },
        data: { balance: { decrement: betAmount } }
      });

      // 4. Create Transaction Record for Acceptor
      await tx.transaction.create({
        data: {
          userId: acceptor.id,
          walletId: acceptor.wallet.id,
          type: 'BET_LOCK',
          status: 'COMPLETED',
          amount: betAmount,
          offerId: offer.id,
          matchId: null // or match.id if we create match first, but circular dependency. Link via offerId is fine or update later.
        }
      });

      // 5. Update Offer
      await tx.betOffer.update({
        where: { id: data.id },
        data: { status: 'MATCHED' }
      });

      // 6. Create Match
      const match = await tx.betMatch.create({
        data: {
          offerId: offer.id,
          creatorId: offer.creatorId,
          acceptorId: acceptor.id,
          creatorAmount: offer.amount,
          acceptorAmount: offer.amount,
          acceptorSelection: acceptorSelection || 'OPPOSITE',
          platformFeeTotal: 0,
          status: 'ACTIVE'
        }
      });

      // Optional: Update transaction with matchId if needed

      return match;
    });

    return NextResponse.json({ success: true, match: result });
  } catch (error) {
    console.error('Error updating challenge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
