'use client';

import { useEffect, useState } from 'react';

type Match = {
    id: string;
    createdAt: string;
    amount: string;
    eventName: string;
    selection: string;
    acceptorSelection: string | null;
    creator: { id: string; name: string | null; code: string };
    acceptor: { id: string; name: string | null; code: string };
};

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

    const handleSettle = async (matchId: string, winnerId: string) => {
        if (!confirm('Are you sure you want to settle this match? This action cannot be undone.')) return;

        setProcessing(matchId);
        try {
            const res = await fetch('/api/admin/settle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matchId, winnerId }),
            });

            if (res.ok) {
                alert('Match settled successfully!');
                fetchMatches(); // Refresh list
            } else {
                const err = await res.json();
                alert(`Error: ${err.error}`);
            }
        } catch (error) {
            console.error('Error settling match:', error);
            alert('Failed to settle match');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return <div>Loading matches...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-foreground">Active Matches</h1>

            {matches.length === 0 ? (
                <p className="text-muted-foreground">No active matches found.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {matches.map((match) => (
                        <div key={match.id} className="bg-card border rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-foreground">{match.eventName}</h3>
                                    <p className="text-sm text-muted-foreground">Amount: ${match.amount}</p>
                                </div>
                                <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded">
                                    Active
                                </span>
                            </div>

                            <div className="space-y-4">
                                {/* Creator Side */}
                                <div className="p-3 bg-muted/50 rounded flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-sm">{match.creator.name || match.creator.code}</p>
                                        <p className="text-xs text-muted-foreground">Bet: {match.selection}</p>
                                    </div>
                                    <button
                                        onClick={() => handleSettle(match.id, match.creator.id)}
                                        disabled={!!processing}
                                        className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {processing === match.id ? '...' : 'Winner'}
                                    </button>
                                </div>

                                {/* Acceptor Side */}
                                <div className="p-3 bg-muted/50 rounded flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-sm">{match.acceptor.name || match.acceptor.code}</p>
                                        <p className="text-xs text-muted-foreground">Bet: {match.acceptorSelection || 'OPPOSITE'}</p>
                                    </div>
                                    <button
                                        onClick={() => handleSettle(match.id, match.acceptor.id)}
                                        disabled={!!processing}
                                        className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {processing === match.id ? '...' : 'Winner'}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 text-xs text-center text-muted-foreground">
                                Settling will release funds to the winner immediately.
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
