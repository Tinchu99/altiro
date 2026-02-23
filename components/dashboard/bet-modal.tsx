"use client"

import { useState } from "react"
import type { Match } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { useBets } from "@/lib/bets-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Shuffle, UserPlus, X, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"

type BetModalProps = {
  match: Match
  onClose: () => void
}

const predictions = [
  { id: "HOME", label: "Victoria local" },
  { id: "DRAW", label: "Empate" },
  { id: "AWAY", label: "Victoria visitante" },
]

export function BetModal({ match, onClose }: BetModalProps) {
  const { user } = useAuth()
  const { placeBet } = useBets()
  const [mode, setMode] = useState<"random" | "direct">("random")
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null)
  const [amount, setAmount] = useState("")
  const [friendCode, setFriendCode] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [matchFound, setMatchFound] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const amountNum = Number.parseFloat(amount) || 0
  const commission = amountNum * 0.05
  const netAmount = amountNum - commission
  const balance = user?.balance ?? 0
  const insufficientFunds = amountNum > balance

  async function handleSubmit() {
    if (!selectedPrediction || amountNum <= 0 || insufficientFunds || !user) return
    if (mode === "direct" && !friendCode.trim()) {
      setSubmitError("Ingresa el codigo del amigo")
      return
    }
    setSubmitError("")
    setIsProcessing(true)

    const predLabel = predictions.find((p) => p.id === selectedPrediction)?.label ?? selectedPrediction

    const result = await placeBet({
      matchId: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      league: match.league,
      prediction: predLabel,
      selection: selectedPrediction as "HOME" | "AWAY" | "DRAW",
      amount: amountNum,
      mode,
      opponent: mode === "direct" ? friendCode.trim() : undefined,
    })

    setIsProcessing(false)

    if (!result.success) {
      setSubmitError(result.error || "No se pudo registrar la apuesta")
      return
    }

    // Set submitted to true and save response data to show correct message
    if (result.matchId) {
      setMatchFound(true);
    }
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-5">
          <div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{match.league}</p>
            <p className="font-display font-semibold text-[hsl(var(--foreground))]">
              {match.homeTeam} vs {match.awayTeam}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--secondary))]"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
              <CheckCircle2 className="h-8 w-8 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="font-display text-xl font-bold text-[hsl(var(--foreground))]">
              {matchFound ? "¡Apuesta Emparejada!" : "Apuesta registrada"}
            </h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {mode === "random"
                ? matchFound
                  ? "¡Hemos encontrado un oponente! Tu apuesta ya está activa."
                  : "Tu apuesta está en proceso. Revisa 'Mis Apuestas' para ver si ya tienes oponente."
                : `Esperando que ${friendCode || "tu amigo"} acepte el reto.`}
            </p>
            <p className="text-xs text-[hsl(var(--accent))]">
              Se descontaron L. {amountNum.toLocaleString()} de tu balance.
            </p>
            <Button
              onClick={onClose}
              className="mt-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(150,80%,38%)]"
            >
              Volver a partidos
            </Button>
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto p-5">
            {/* Balance indicator */}
            <div className="mb-5 flex items-center justify-between rounded-lg bg-[hsl(var(--secondary))] px-4 py-2.5">
              <span className="text-xs text-[hsl(var(--muted-foreground))]">Tu balance disponible</span>
              <span className="font-display text-sm font-bold text-[hsl(var(--primary))]">
                L. {balance.toLocaleString()}
              </span>
            </div>

            {/* Mode selector */}
            <div className="mb-5">
              <p className="mb-2 text-xs font-medium text-[hsl(var(--muted-foreground))]">MODO DE APUESTA</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("random")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all",
                    mode === "random"
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                      : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]/30"
                  )}
                >
                  <Shuffle className="h-4 w-4" />
                  Aleatorio
                </button>
                <button
                  type="button"
                  onClick={() => setMode("direct")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all",
                    mode === "direct"
                      ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]"
                      : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--accent))]/30"
                  )}
                >
                  <UserPlus className="h-4 w-4" />
                  Reto directo
                </button>
              </div>
            </div>

            {/* Direct mode: friend code */}
            {mode === "direct" && (
              <div className="mb-5">
                <p className="mb-2 text-xs font-medium text-[hsl(var(--muted-foreground))]">CODIGO DE AMIGO</p>
                <Input
                  placeholder="Ingresa el codigo de usuario"
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value)}
                  className="border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
                />
                <div className="mt-2 flex items-center gap-1.5 text-[hsl(var(--accent))]">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span className="text-xs">Limite mensual: L. 10,000 en retos directos</span>
                </div>
              </div>
            )}

            {/* Prediction */}
            <div className="mb-5">
              <p className="mb-2 text-xs font-medium text-[hsl(var(--muted-foreground))]">TU PREDICCION</p>
              <div className="grid grid-cols-3 gap-2">
                {predictions.map((pred) => (
                  <button
                    key={pred.id}
                    type="button"
                    onClick={() => setSelectedPrediction(pred.id)}
                    className={cn(
                      "rounded-lg border p-3 text-center text-xs font-medium transition-all",
                      selectedPrediction === pred.id
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                        : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]/30"
                    )}
                  >
                    {pred.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="mb-5">
              <p className="mb-2 text-xs font-medium text-[hsl(var(--muted-foreground))]">MONTO (LPS)</p>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={cn(
                  "border-[hsl(var(--border))] bg-[hsl(var(--background))] font-display text-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]",
                  insufficientFunds && "border-[hsl(var(--destructive))]"
                )}
              />
              {insufficientFunds && (
                <p className="mt-1 text-xs text-[hsl(var(--destructive))]">Fondos insuficientes</p>
              )}
              <div className="mt-2 flex gap-2">
                {[100, 250, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(String(preset))}
                    className={cn(
                      "rounded-md border border-[hsl(var(--border))] px-3 py-1 text-xs text-[hsl(var(--muted-foreground))] transition-colors hover:border-[hsl(var(--primary))]/30 hover:text-[hsl(var(--foreground))]",
                      preset > balance && "opacity-40"
                    )}
                    disabled={preset > balance}
                  >
                    L. {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            {amountNum > 0 && !insufficientFunds && (
              <div className="mb-5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[hsl(var(--muted-foreground))]">Monto</span>
                  <span className="text-[hsl(var(--foreground))]">L. {amountNum.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-[hsl(var(--muted-foreground))]">Comision (5%)</span>
                  <span className="text-[hsl(var(--accent))]">- L. {commission.toFixed(2)}</span>
                </div>
                <hr className="my-2 border-[hsl(var(--border))]" />
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-[hsl(var(--muted-foreground))]">Si ganas, recibes</span>
                  <span className="text-[hsl(var(--primary))]">L. {(netAmount + amountNum).toFixed(2)}</span>
                </div>
              </div>
            )}

            {submitError && (
              <div className="mb-4 rounded-lg bg-[hsl(var(--destructive))]/10 p-3 text-sm text-[hsl(var(--destructive))]">
                {submitError}
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!selectedPrediction || amountNum <= 0 || insufficientFunds || isProcessing}
              className="w-full bg-[hsl(var(--primary))] font-display text-[hsl(var(--primary-foreground))] hover:bg-[hsl(150,80%,38%)] disabled:opacity-40"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </span>
              ) : mode === "random" ? (
                "Buscar oponente aleatorio"
              ) : (
                "Enviar reto"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
