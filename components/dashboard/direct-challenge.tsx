import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getReceivedChallenges, updateChallengeStatus, createChallenge, Challenge } from '@/lib/challenge-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBets } from '@/lib/bets-context';

export default function DirectChallenge() {
  const { user } = useAuth();
  const { fetchBets } = useBets();

  const [loadingReceived, setLoadingReceived] = useState(false);
  const [received, setReceived] = useState<Challenge[]>([]);

  // Send Challenge State
  const [targetCode, setTargetCode] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState('');
  const [loadingSend, setLoadingSend] = useState(false);

  // Accept Challenge State
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [acceptingChallenge, setAcceptingChallenge] = useState<Challenge | null>(null);
  const [acceptorPrediction, setAcceptorPrediction] = useState<string | null>(null);

  async function fetchReceived() {
    if (!user) return;
    setLoadingReceived(true);
    try {
      const res = await getReceivedChallenges(user.code);
      setReceived(res.challenges || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReceived(false);
    }
  }

  useEffect(() => {
    fetchReceived();
    // eslint-disable-next-line
  }, [user]);

  async function handleSendChallenge(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSendError('');
    setSendSuccess('');
    setLoadingSend(true);

    try {
      const res = await createChallenge({
        fromUser: user.id,
        toUserCode: targetCode,
        amount: Number(amount),
        message,
      });

      if (res.error) {
        setSendError(res.error);
      } else {
        setSendSuccess('Reto enviado exitosamente');
        setTargetCode('');
        setAmount('');
        setMessage('');
        fetchReceived();
      }
    } catch (err) {
      setSendError('Error al enviar el reto');
    } finally {
      setLoadingSend(false);
    }
  }

  async function handleAccept() {
    if (!acceptingChallenge || !acceptorPrediction) return;

    setProcessingId(acceptingChallenge.id);
    try {
      const res = await updateChallengeStatus(acceptingChallenge.id, 'accept', acceptorPrediction);
      if (res.success) {
        await fetchBets();
        fetchReceived();
        setAcceptingChallenge(null);
        setAcceptorPrediction(null);
      }
    } catch (error) {
      console.error("Error accepting", error);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleAction(id: string, action: 'accept' | 'reject') {
    if (action === 'accept') {
      const challenge = received.find(c => c.id === id);
      // If challenge has specific selection (HOME/AWAY/DRAW), require acceptor to choose
      if (challenge && challenge.selection && ['HOME', 'AWAY', 'DRAW'].includes(challenge.selection)) {
        setAcceptingChallenge(challenge);
        setAcceptorPrediction(null);
        return;
      }
      // Fallback for generic 'Direct Challenge' text or other
    }

    setProcessingId(id);
    try {
      await updateChallengeStatus(id, action);
      if (action === 'accept') await fetchBets();
      fetchReceived();
    } catch (error) {
      console.error("Error handling action", error);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className='space-y-8 relative'>
      {/* Accepting Modal/Overlay */}
      {acceptingChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={() => setAcceptingChallenge(null)}
            >
              X
            </Button>
            <h3 className="mb-4 text-lg font-bold">Aceptar Reto</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              El retador eligió: <span className="font-bold text-foreground">{acceptingChallenge.selection}</span>.
              <br />
              Elige tu posición para aceptar la apuesta:
            </p>

            <div className="grid grid-cols-2 gap-2 mb-6">
              {['HOME', 'DRAW', 'AWAY']
                .filter(opt => opt !== acceptingChallenge.selection) // Filter out challenger's pick
                .map(opt => (
                  <Button
                    key={opt}
                    variant={acceptorPrediction === opt ? 'default' : 'outline'}
                    onClick={() => setAcceptorPrediction(opt)}
                    className="w-full"
                  >
                    {opt === 'HOME' ? 'Local' : opt === 'AWAY' ? 'Visitante' : 'Empate'}
                  </Button>
                ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAccept}
                disabled={!acceptorPrediction || !!processingId}
                className="w-full"
              >
                {processingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirmar Apuesta
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-bold font-display'>Retos recibidos</h2>
          <Button
            variant='ghost'
            size='sm'
            onClick={fetchReceived}
            disabled={loadingReceived}
          >
            <RefreshCcw className={cn("h-4 w-4", loadingReceived && "animate-spin")} />
          </Button>
        </div>

        {received.length === 0 ? (
          <div className='text-sm text-center py-8 text-muted-foreground'>
            No tienes retos pendientes.
          </div>
        ) : (
          <ul className='space-y-4'>
            {received.map((c) => (
              <li key={c.id} className='border rounded-lg p-4 bg-muted/30'>
                <div className="grid gap-1 mb-3">
                  <div className="font-semibold text-sm">De: {c.fromUser}</div>
                  {c.eventName && c.eventName !== 'General Bet' && (
                    <div className="text-xs font-medium text-primary/80">
                      {c.eventName} ({c.league})
                    </div>
                  )}
                  {c.selection && (
                    <div className="text-xs text-muted-foreground">
                      Predicción: <span className="font-bold text-foreground">{c.selection}</span>
                    </div>
                  )}
                  <div className="text-sm font-bold text-green-600">L. {c.amount}</div>
                  {c.message && <div className="text-xs italic text-muted-foreground">"{c.message}"</div>}
                </div>

                {c.status === 'pending' && (
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      className="flex-1"
                      onClick={() => handleAction(c.id, 'accept')}
                      disabled={!!processingId}
                    >
                      {processingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aceptar'}
                    </Button>
                    <Button
                      size='sm'
                      variant='destructive'
                      className="flex-1"
                      onClick={() => handleAction(c.id, 'reject')}
                      disabled={!!processingId}
                    >
                      Rechazar
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
