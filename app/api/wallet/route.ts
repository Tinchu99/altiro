import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { wallet: true }
        });

        if (!user || !user.wallet) {
            return NextResponse.json({ error: 'User or wallet not found' }, { status: 404 });
        }

        return NextResponse.json({
            balance: Number(user.wallet.balance),
            currency: user.wallet.currency
        });
    } catch (error) {
        console.error('Error fetching wallet:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
