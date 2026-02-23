"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Bet } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"

type BetsContextType = {
  bets: Bet[]
  placeBet: (
    bet: Omit<Bet, "id" | "date" | "status">
  ) => Promise<{ success: boolean; error?: string; matchId?: string | null }>
  simulateResults: () => void
  fetchBets: () => Promise<void>
}

const BetsContext = createContext<BetsContextType | null>(null)

const opponents = [
  "Usuario #8472",
  "Usuario #3291",
  "Usuario #1847",
  "Usuario #5632",
  "Usuario #9104",
  "Usuario #6753",
  "Carlos M.",
  "Maria L.",
  "Pedro R.",
  "Ana S.",
]

export function BetsProvider({ children }: { children: ReactNode }) {
  const { user, updateBalance, refreshBalance } = useAuth()
  const [bets, setBets] = useState<Bet[]>([])

  // Load bets from API
  const fetchBets = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/bets?userId=${user.id}&t=${Date.now()}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        console.log("BetsProvider fetched:", data);
        setBets(data.bets || [])
      } else {
        console.error("BetsProvider fetch failed:", res.status);
      }
    } catch (error) {
      console.error("Error loading bets:", error)
    }
  }, [user])

  useEffect(() => {
    fetchBets()
  }, [fetchBets])

  // No localStorage or simulation anymore
  // rely on API

  const placeBet = useCallback(
    async (betData: Omit<Bet, "id" | "date" | "status">) => {
      if (!user) return { success: false, error: "No hay usuario" }

      try {
        const res = await fetch("/api/bets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            eventId: betData.matchId,
            selection: betData.selection || "HOME",
            amount: betData.amount,
            mode: betData.mode,
            opponentCode: betData.mode === "direct" ? betData.opponent : undefined,
          }),
        })

        const data = await res.json()
        if (!res.ok) {
          return { success: false, error: data?.error || "Error al guardar la apuesta" }
        }

        // Refresh bets from server
        await fetchBets();

        // Refresh balance from database
        await refreshBalance();

        return { success: true, ...data }
      } catch (error) {
        return { success: false, error: "Error al conectar con el servidor" }
      }
    },
    [user, fetchBets, refreshBalance]
  )

  const simulateResults = useCallback(() => {
    // Removed mock simulation
    alert("Simulación desactivada en modo producción/API real.");
  }, [])

  return (
    <BetsContext.Provider value={{ bets, placeBet, simulateResults, fetchBets }}>
      {children}
    </BetsContext.Provider>
  )
}

export function useBets() {
  const ctx = useContext(BetsContext)
  if (!ctx) throw new Error("useBets must be used within BetsProvider")
  return ctx
}
