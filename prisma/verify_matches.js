const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.sportEvent.count();
    console.log(`Total matches in database: ${count}`);

    const events = await prisma.sportEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    console.log('Latest 5 matches:');
    events.forEach(e => console.log(`- ${e.homeTeam} vs ${e.awayTeam} (${e.status})`));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
