"use client"

import { useAuth } from "@/lib/auth-context"
import { useBets } from "@/lib/bets-context"
import { cn } from "@/lib/utils"
import { ArrowDownLeft, ArrowUpRight, Trophy, XCircle, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export function WalletView() {
  const { user, updateBalance, refreshBalance } = useAuth()
  const { bets } = useBets()

  // Refresh balance from database when component mounts
  useEffect(() => {
    refreshBalance()
  }, [refreshBalance])

  const balance = user?.balance ?? 0
  const directBets = bets.filter((b) => b.mode === "direct")
  const monthlySpent = directBets.reduce((acc, b) => acc + b.amount, 0)
  const monthlyLimit = 10000

  const wonBets = bets.filter((b) => b.status === "won")
  const lostBets = bets.filter((b) => b.status === "lost")

  // Build transaction log from bets
  const transactions = bets
    .filter((b) => b.status === "won" || b.status === "lost")
    .map((b) => ({
      id: b.id,
      type: b.status === "won" ? ("bet_won" as const) : ("bet_lost" as const),
      amount: b.status === "won" ? b.amount * 2 * 0.95 : -b.amount,
      date: b.date,
      description: `${b.status === "won" ? "Ganancia" : "Perdida"} - ${b.homeTeam} vs ${b.awayTeam}`,
    }))

  const iconMap = {
    deposit: { icon: ArrowDownLeft, color: "hsl(var(--primary))" },
    withdrawal: { icon: ArrowUpRight, color: "hsl(var(--accent))" },
    bet_won: { icon: Trophy, color: "hsl(var(--primary))" },
    bet_lost: { icon: XCircle, color: "hsl(var(--destructive))" },
  }

  function handleDeposit() {
    updateBalance(2000)
  }

  return (
    <div>
      {/* Balance card */}
      <div className="mb-8 rounded-2xl border border-[hsl(var(--primary))]/20 bg-[hsl(var(--card))] p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
              <Wallet className="h-4 w-4" />
              <span className="text-sm">Balance disponible</span>
            </div>
            <p className="font-display text-4xl font-bold text-[hsl(var(--foreground))] md:text-5xl">
              L. {balance.toLocaleString()}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleDeposit}
              className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(150,80%,38%)]"
            >
              Depositar L. 2,000
            </Button>
            <Button
              variant="outline"
              className="border-[hsl(var(--border))] bg-transparent text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]"
              disabled={balance <= 0}
            >
              Retirar
            </Button>
          </div>
        </div>

        {/* Monthly limit bar */}
        <div className="mt-6 border-t border-[hsl(var(--border))] pt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-[hsl(var(--muted-foreground))]">Limite mensual (retos directos)</span>
            <span className="text-[hsl(var(--foreground))]">
              L. {monthlySpent.toLocaleString()} / L. {monthlyLimit.toLocaleString()}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[hsl(var(--secondary))]">
            <div
              className="h-full rounded-full bg-[hsl(var(--accent))] transition-all"
              style={{ width: `${Math.min((monthlySpent / monthlyLimit) * 100, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            L. {Math.max(monthlyLimit - monthlySpent, 0).toLocaleString()} disponibles para retos directos este mes
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Apuestas totales</p>
          <p className="mt-1 font-display text-2xl font-bold text-[hsl(var(--foreground))]">{bets.length}</p>
        </div>
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Ganadas</p>
          <p className="mt-1 font-display text-2xl font-bold text-[hsl(var(--primary))]">{wonBets.length}</p>
        </div>
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Perdidas</p>
          <p className="mt-1 font-display text-2xl font-bold text-[hsl(var(--destructive))]">{lostBets.length}</p>
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="mb-4 font-display text-lg font-semibold text-[hsl(var(--foreground))]">
          Movimientos recientes
        </h2>
        {transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
            Aun no hay movimientos. Realiza tu primera apuesta para ver actividad aqui.
          </p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => {
              const config = iconMap[tx.type]
              const TxIcon = config.icon
              const isPositive = tx.amount > 0

              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${config.color}15` }}
                  >
                    <TxIcon className="h-5 w-5" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[hsl(var(--foreground))]">{tx.description}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{tx.date}</p>
                  </div>
                  <span
                    className={cn(
                      "font-display text-sm font-semibold",
                      isPositive ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--destructive))]"
                    )}
                  >
                    {isPositive ? "+" : ""}L. {Math.abs(tx.amount).toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
