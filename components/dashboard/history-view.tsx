"use client"

import { useBets } from "@/lib/bets-context"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, Shuffle, UserPlus, BarChart3 } from "lucide-react"

export function HistoryView() {
  const { bets } = useBets()

  const resolvedBets = bets.filter((b) => b.status === "won" || b.status === "lost" || b.status === "refunded")
  const totalWon = resolvedBets
    .filter((h) => h.status === "won")
    .reduce((acc, h) => acc + h.amount * 2 * 0.95, 0)
  const totalLost = resolvedBets
    .filter((h) => h.status === "lost")
    .reduce((acc, h) => acc + h.amount, 0)
  const winRate =
    resolvedBets.length > 0
      ? Math.round(
        (resolvedBets.filter((h) => h.status === "won").length / resolvedBets.length) * 100
      )
      : 0

  if (resolvedBets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--secondary))]">
          <BarChart3 className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
        </div>
        <h2 className="mb-2 font-display text-xl font-bold text-[hsl(var(--foreground))]">
          Sin historial aun
        </h2>
        <p className="max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
          Cuando tus apuestas se resuelvan, podras ver tu historial completo y estadisticas aqui.
          Usa el boton "Simular resultados" en Mis Apuestas para resolver tus apuestas emparejadas.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Summary stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Total ganado</p>
          <p className="mt-1 font-display text-2xl font-bold text-[hsl(var(--primary))]">
            L. {totalWon.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Total perdido</p>
          <p className="mt-1 font-display text-2xl font-bold text-[hsl(var(--destructive))]">
            L. {totalLost.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Tasa de acierto</p>
          <p className="mt-1 font-display text-2xl font-bold text-[hsl(var(--foreground))]">{winRate}%</p>
        </div>
      </div>

      {/* History list */}
      <h2 className="mb-4 font-display text-lg font-semibold text-[hsl(var(--foreground))]">
        Historial de apuestas
      </h2>
      <div className="space-y-2">
        {resolvedBets.map((bet) => {
          const payout = bet.status === "won" ? bet.amount * 2 * 0.95 : 0

          return (
            <div
              key={bet.id}
              className="flex items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
            >
              {bet.status === "won" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[hsl(var(--primary))]" />
              ) : bet.status === "refunded" ? (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-500">
                  <span className="text-sm font-bold">-</span>
                </div>
              ) : (
                <XCircle className="h-5 w-5 shrink-0 text-[hsl(var(--destructive))]" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {bet.mode === "random" ? (
                    <Shuffle className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                  ) : (
                    <UserPlus className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                  )}
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {bet.homeTeam} vs {bet.awayTeam}
                  </p>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {bet.prediction} {bet.opponent ? `vs ${bet.opponent}` : ""} &middot; {bet.date}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "font-display text-sm font-semibold",
                    bet.status === "won"
                      ? "text-[hsl(var(--primary))]"
                      : bet.status === "refunded"
                        ? "text-orange-500"
                        : "text-[hsl(var(--destructive))]"
                  )}
                >
                  {bet.status === "won"
                    ? `+L. ${payout.toLocaleString()}`
                    : bet.status === "refunded"
                      ? `Devuelto`
                      : `-L. ${bet.amount.toLocaleString()}`}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {bet.status === "refunded"
                    ? "Apuesta reembolsada"
                    : `Apuesta: L. ${bet.amount.toLocaleString()}`}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
