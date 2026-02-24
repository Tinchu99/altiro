'use client';

import { useEffect, useState } from 'react';

type Match = {
    id: string;
    createdAt: string;
    amount: string;
    eventName: string;
    eventId?: string | null;
    selection: string;
    acceptorSelection: string | null;
    creator: { id: string; name: string | null; code: string };
    acceptor: { id: string; name: string | null; code: string };
};

type GroupedMatches = {
    [key: string]: {
        eventName: string;
        eventId: string;
        matches: Match[];
        totalAmountPool: number;
    }
}

export default function AdminMatchesPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const fetchMatches = async () => {
        try {
            const res = await fetch('/api/admin/matches');
            if (res.ok) {
                const data = await res.json();
                setMatches(data.matches);
            }
        } catch (error) {
            console.error('Error fetching matches:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    // Agrupar las apuestas individuales (match) por evento
    const groupMatchesByEvent = (matchesArray: Match[]): GroupedMatches => {
        const grouped: GroupedMatches = {};

        matchesArray.forEach(match => {
            // Si una apuesta no tiene eventId (retos directos sin evento), la agrupamos por su propio id
            const groupId = match.eventId || match.id;

            if (!grouped[groupId]) {
                grouped[groupId] = {
                    eventName: match.eventName,
                    eventId: groupId,
                    matches: [],
                    totalAmountPool: 0
                };
            }
            grouped[groupId].matches.push(match);

            // Pool is creator + acceptor amount (assuming equal)
            grouped[groupId].totalAmountPool += (Number(match.amount) * 2);
        });

        return grouped;
    };

    const handleSettle = async (eventIdOrMatchId: string, actualResult: string, isEventId: boolean) => {
        if (!confirm('Are you sure you want to settle this? This action cannot be undone and will distribute funds to all winners.')) return;

        setProcessing(eventIdOrMatchId);
        try {
            const res = await fetch('/api/admin/settle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId: isEventId ? eventIdOrMatchId : undefined,
                    matchId: !isEventId ? eventIdOrMatchId : undefined,
                    actualResult
                }),
            });

            if (res.ok) {
                const result = await res.json();
                alert(`Successfully settled ${result.settledCount} match(es)!`);
                fetchMatches(); // Refresh list
            } else {
                const err = await res.json();
                alert(`Error: ${err.error}`);
            }
        } catch (error) {
            console.error('Error settling matches:', error);
            alert('Failed to settle match(es)');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return <div>Loading active matches...</div>;

    const groupedData = groupMatchesByEvent(matches);
    const eventGroups = Object.values(groupedData);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-foreground">Active Matches (Grouped by Event)</h1>

            {eventGroups.length === 0 ? (
                <p className="text-muted-foreground">No active matches found.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    {eventGroups.map((group) => {
                        const isEvent = group.matches.length > 0 && group.matches[0].eventId != null;

                        return (
                            <div key={group.eventId} className="bg-card border rounded-lg p-4 shadow-sm flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-foreground">{group.eventName}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Total Stake Pool: <span className="text-primary font-semibold">${group.totalAmountPool}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Active Bets: {group.matches.length}
                                        </p>
                                    </div>
                                    <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded">
                                        Active
                                    </span>
                                </div>

                                <div className="flex-1 space-y-2 mb-4 overflow-y-auto max-h-48 border border-muted p-2 rounded-md">
                                    {group.matches.map(match => (
                                        <div key={match.id} className="p-2 bg-muted/30 rounded text-xs">
                                            <div className="flex justify-between items-center whitespace-nowrap overflow-hidden text-ellipsis">
                                                <span className="font-semibold text-foreground truncate w-1/3">
                                                    {match.creator.name || match.creator.code}
                                                </span>
                                                <span className="text-primary font-bold px-1 text-[10px] w-1/6 text-center">
                                                    VS
                                                </span>
                                                <span className="font-semibold text-foreground text-right truncate w-1/3">
                                                    {match.acceptor.name || match.acceptor.code}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center mt-1 text-[10px] text-muted-foreground">
                                                <span>{match.selection}</span>
                                                <span>(${match.amount})</span>
                                                <span>{match.acceptorSelection || 'OPPOSITE'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-center mb-3">¿Cuál fue el resultado real del partido?</p>

                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => handleSettle(group.eventId, 'HOME', isEvent)}
                                            disabled={!!processing}
                                            className="bg-primary text-primary-foreground text-xs px-2 py-2 rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                        >
                                            {processing === group.eventId ? '...' : 'Local Gano'}
                                        </button>
                                        <button
                                            onClick={() => handleSettle(group.eventId, 'DRAW', isEvent)}
                                            disabled={!!processing}
                                            className="bg-orange-500 text-white text-xs px-2 py-2 rounded hover:bg-orange-600 disabled:opacity-50 transition-colors"
                                        >
                                            {processing === group.eventId ? '...' : 'Empate'}
                                        </button>
                                        <button
                                            onClick={() => handleSettle(group.eventId, 'AWAY', isEvent)}
                                            disabled={!!processing}
                                            className="bg-primary text-primary-foreground text-xs px-2 py-2 rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                        >
                                            {processing === group.eventId ? '...' : 'Visitante Gano'}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 text-xs text-center text-muted-foreground">
                                    Settling this event will release funds to all {group.matches.length} matches simultaneously.
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
