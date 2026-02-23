export type Match = {
  id: string
  homeTeam: string
  awayTeam: string
  league: string
  leagueCountry: string
  date: string
  time: string
  status: "upcoming" | "live" | "finished"
  score?: { home: number; away: number }
  minute?: number
  activeBets: number
}

export type Bet = {
  id: string
  matchId: string
  homeTeam: string
  awayTeam: string
  league: string
  prediction: string
  selection?: "HOME" | "AWAY" | "DRAW"
  amount: number
  mode: "random" | "direct"
  status: "pending" | "matched" | "won" | "lost" | "refunded"
  opponent?: string
  date: string
}

export type Transaction = {
  id: string
  type: "deposit" | "withdrawal" | "bet_won" | "bet_lost" | "commission"
  amount: number
  date: string
  description: string
}

export const matches: Match[] = [
  {
    id: "1",
    homeTeam: "FC Barcelona",
    awayTeam: "Real Madrid",
    league: "La Liga",
    leagueCountry: "ES",
    date: "2026-02-10",
    time: "21:00",
    status: "live",
    score: { home: 1, away: 1 },
    minute: 67,
    activeBets: 1243,
  },
  {
    id: "2",
    homeTeam: "Manchester City",
    awayTeam: "Liverpool",
    league: "Premier League",
    leagueCountry: "GB",
    date: "2026-02-10",
    time: "17:30",
    status: "live",
    score: { home: 2, away: 0 },
    minute: 34,
    activeBets: 892,
  },
  {
    id: "3",
    homeTeam: "Juventus",
    awayTeam: "AC Milan",
    league: "Serie A",
    leagueCountry: "IT",
    date: "2026-02-10",
    time: "20:45",
    status: "upcoming",
    activeBets: 456,
  },
  {
    id: "4",
    homeTeam: "Bayern Munich",
    awayTeam: "Borussia Dortmund",
    league: "Bundesliga",
    leagueCountry: "DE",
    date: "2026-02-11",
    time: "18:30",
    status: "upcoming",
    activeBets: 678,
  },
  {
    id: "5",
    homeTeam: "PSG",
    awayTeam: "Olympique Marseille",
    league: "Ligue 1",
    leagueCountry: "FR",
    date: "2026-02-11",
    time: "21:00",
    status: "upcoming",
    activeBets: 345,
  },
  {
    id: "6",
    homeTeam: "Olimpia",
    awayTeam: "Motagua",
    league: "Liga Nacional",
    leagueCountry: "HN",
    date: "2026-02-10",
    time: "19:00",
    status: "live",
    score: { home: 0, away: 1 },
    minute: 52,
    activeBets: 234,
  },
  {
    id: "7",
    homeTeam: "Real Espana",
    awayTeam: "Marathon",
    league: "Liga Nacional",
    leagueCountry: "HN",
    date: "2026-02-11",
    time: "15:00",
    status: "upcoming",
    activeBets: 189,
  },
  {
    id: "8",
    homeTeam: "Atletico Madrid",
    awayTeam: "Real Sociedad",
    league: "La Liga",
    leagueCountry: "ES",
    date: "2026-02-11",
    time: "16:15",
    status: "upcoming",
    activeBets: 521,
  },
]

export const myBets: Bet[] = [
  {
    id: "b1",
    matchId: "1",
    homeTeam: "FC Barcelona",
    awayTeam: "Real Madrid",
    league: "La Liga",
    prediction: "Victoria FC Barcelona",
    amount: 500,
    mode: "random",
    status: "matched",
    opponent: "Usuario #8472",
    date: "2026-02-10",
  },
  {
    id: "b2",
    matchId: "6",
    homeTeam: "Olimpia",
    awayTeam: "Motagua",
    league: "Liga Nacional",
    prediction: "Motagua gana",
    amount: 200,
    mode: "direct",
    status: "matched",
    opponent: "Carlos M.",
    date: "2026-02-10",
  },
  {
    id: "b3",
    matchId: "3",
    homeTeam: "Juventus",
    awayTeam: "AC Milan",
    league: "Serie A",
    prediction: "Empate",
    amount: 300,
    mode: "random",
    status: "pending",
    date: "2026-02-10",
  },
]

export const transactions: Transaction[] = [
  { id: "t1", type: "deposit", amount: 5000, date: "2026-02-08", description: "Deposito desde Banco Atlantida" },
  { id: "t2", type: "bet_won", amount: 950, date: "2026-02-07", description: "Ganancia - Arsenal vs Chelsea" },
  { id: "t3", type: "commission", amount: -50, date: "2026-02-07", description: "Comision 5% - Arsenal vs Chelsea" },
  { id: "t4", type: "bet_lost", amount: -400, date: "2026-02-06", description: "Perdida - PSG vs Lyon" },
  { id: "t5", type: "deposit", amount: 2000, date: "2026-02-05", description: "Deposito desde BAC Honduras" },
  { id: "t6", type: "withdrawal", amount: -1500, date: "2026-02-04", description: "Retiro a Banco Atlantida" },
  { id: "t7", type: "bet_won", amount: 1900, date: "2026-02-03", description: "Ganancia - Olimpia vs Real Espana" },
  { id: "t8", type: "commission", amount: -100, date: "2026-02-03", description: "Comision 5% - Olimpia vs Real Espana" },
]
