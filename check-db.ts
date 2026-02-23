import { prisma } from './lib/prisma'

async function check() {
    const users = await prisma.user.findMany({ include: { wallet: true } })
    console.log("USERS:", users.map(u => ({ id: u.id, email: u.email, code: u.code, balance: Number(u.wallet?.balance) })))
    const events = await prisma.sportEvent.findMany({ take: 1 })
    console.log("EVENTS:", events.map(e => ({ id: e.id, home: e.homeTeam, away: e.awayTeam })))
}
check()
