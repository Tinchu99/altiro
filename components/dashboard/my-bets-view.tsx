"use client"

import { useBets } from "@/lib/bets-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Shuffle, UserPlus, Clock, CheckCircle2, XCircle, Loader2, Zap, Trophy } from "lucide-react"

const statusConfig = {
  pending: { label: "Esperando match", icon: Clock, color: "hsl(var(--accent))" },
  matched: { label: "Emparejado", icon: Loader2, color: "hsl(var(--primary))" },
  won: { label: "Ganada", icon: Trophy, color: "hsl(var(--primary))" },
  lost: { label: "Perdida", icon: XCircle, color: "hsl(var(--destructive))" },
}

export function MyBetsView() {
  const { bets, simulateResults, fetchBets } = useBets()
  console.log("MyBetsView rendering bets:", bets);

  const activeBets = bets.filter((b) => b.status === "pending" || b.status === "matched")
  const resolvedBets = bets.filter((b) => b.status === "won" || b.status === "lost")
  const hasMatchedBets = bets.some((b) => b.status === "matched")

  if (bets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--secondary))]">
          <Zap className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
        </div>
        <h2 className="mb-2 font-display text-xl font-bold text-[hsl(var(--foreground))]">
          No tienes apuestas aun
        </h2>
        <p className="max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
          Ve a la seccion de Partidos, elige un encuentro y realiza tu primera apuesta. Tu balance inicial es de L. 5,000.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-[hsl(var(--foreground))]">Mis apuestas</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {activeBets.length} activas, {resolvedBets.length} resueltas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchBets()}
            title="Actualizar apuestas"
          >
            <Loader2 className="h-4 w-4" />
          </Button>
          {hasMatchedBets && (
            <Button
              onClick={simulateResults}
              className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(38,92%,48%)]"
            >
              <Zap className="mr-2 h-4 w-4" />
              Simular resultados
            </Button>
          )}
        </div>
      </div>

      {/* Active bets */}
      {activeBets.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">ACTIVAS</h3>
          <div className="space-y-3">
            {activeBets.map((bet) => {
              const status = statusConfig[bet.status]
              const StatusIcon = status.icon

              return (
                <div
                  key={bet.id}
                  className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        {bet.mode === "random" ? (
                          <Shuffle className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                        ) : (
                          <UserPlus className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
                        )}
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                          {bet.mode === "random" ? "Aleatorio" : "Reto directo"}
                        </span>
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">&middot;</span>
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">{bet.league}</span>
                      </div>
                      <p className="font-display font-semibold text-[hsl(var(--foreground))]">
                        {bet.homeTeam} vs {bet.awayTeam}
                      </p>
                      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                        Prediccion: <span className="text-[hsl(var(--foreground))]">{bet.prediction}</span>
                      </p>
                      {bet.opponent && (
                        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                          vs {bet.opponent}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="font-display text-lg font-bold text-[hsl(var(--foreground))]">
                        L. {bet.amount.toLocaleString()}
                      </span>
                      <div
                        className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                        style={{ backgroundColor: `${status.color}15` }}
                      >
                        <StatusIcon className="h-3.5 w-3.5" style={{ color: status.color }} />
                        <span className="text-xs font-semibold" style={{ color: status.color }}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Resolved bets */}
      {resolvedBets.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">RESUELTAS</h3>
          <div className="space-y-3">
            {resolvedBets.map((bet) => {
              const status = statusConfig[bet.status]
              const StatusIcon = status.icon
              const payout = bet.status === "won" ? bet.amount * 2 * 0.95 : 0

              return (
                <div
                  key={bet.id}
                  className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 opacity-80"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        {bet.mode === "random" ? (
                          <Shuffle className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                        ) : (
                          <UserPlus className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                        )}
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">{bet.league}</span>
                      </div>
                      <p className="font-display font-semibold text-[hsl(var(--foreground))]">
                        {bet.homeTeam} vs {bet.awayTeam}
                      </p>
                      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                        {bet.prediction} {bet.opponent ? `vs ${bet.opponent}` : ""}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={cn(
                          "font-display text-lg font-bold",
                          bet.status === "won"
                            ? "text-[hsl(var(--primary))]"
                            : "text-[hsl(var(--destructive))]"
                        )}
                      >
                        {bet.status === "won"
                          ? `+L. ${payout.toLocaleString()}`
                          : `-L. ${bet.amount.toLocaleString()}`}
                      </span>
                      <div
                        className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                        style={{ backgroundColor: `${status.color}15` }}
                      >
                        <StatusIcon className="h-3.5 w-3.5" style={{ color: status.color }} />
                        <span className="text-xs font-semibold" style={{ color: status.color }}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
