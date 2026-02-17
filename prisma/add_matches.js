const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const now = new Date();

    const newEvents = [
        // Premier League
        {
            homeTeam: 'Liverpool',
            awayTeam: 'Manchester United',
            leagueName: 'Premier League',
            startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // In 2 hours
            status: 'SCHEDULED',
        },
        {
            homeTeam: 'Arsenal',
            awayTeam: 'Chelsea',
            leagueName: 'Premier League',
            startTime: new Date(now.getTime() + 26 * 60 * 60 * 1000), // Tomorrow
            status: 'SCHEDULED',
        },
        {
            homeTeam: 'Manchester City',
            awayTeam: 'Tottenham',
            leagueName: 'Premier League',
            startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
            status: 'LIVE',
            homeScore: 1,
            awayScore: 1,
        },

        // La Liga
        {
            homeTeam: 'Real Madrid',
            awayTeam: 'Barcelona',
            leagueName: 'La Liga',
            startTime: new Date(now.getTime() + 48 * 60 * 60 * 1000), // In 2 days
            status: 'SCHEDULED',
        },
        {
            homeTeam: 'Atletico Madrid',
            awayTeam: 'Sevilla',
            leagueName: 'La Liga',
            startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
            status: 'FINISHED',
            homeScore: 2,
            awayScore: 0,
        },

        // Serie A
        {
            homeTeam: 'Juventus',
            awayTeam: 'AC Milan',
            leagueName: 'Serie A',
            startTime: new Date(now.getTime() + 5 * 60 * 60 * 1000), // In 5 hours
            status: 'SCHEDULED',
        },
        {
            homeTeam: 'Inter Milan',
            awayTeam: 'Napoli',
            leagueName: 'Serie A',
            startTime: new Date(now.getTime() + 72 * 60 * 60 * 1000), // In 3 days
            status: 'SCHEDULED',
        },

        // Bundesliga
        {
            homeTeam: 'Bayern Munich',
            awayTeam: 'Dortmund',
            leagueName: 'Bundesliga',
            startTime: new Date(now.getTime() + 30 * 60 * 60 * 1000), // Tomorrow
            status: 'SCHEDULED',
        },

        // Champions League (Next Week)
        {
            homeTeam: 'PSG',
            awayTeam: 'Real Madrid',
            leagueName: 'UEFA Champions League',
            startTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Next week
            status: 'SCHEDULED',
        }
    ];

    console.log(`Adding ${newEvents.length} new matches...`);

    for (const event of newEvents) {
        const createdEvent = await prisma.sportEvent.create({
            data: event,
        });
        console.log(`Created event: ${createdEvent.homeTeam} vs ${createdEvent.awayTeam}`);
    }

    console.log('Finished adding matches.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
