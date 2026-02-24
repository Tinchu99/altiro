"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserPlus, UserMinus, Search, Users, Loader2 } from "lucide-react"

type Friend = {
    id: string
    name: string
    code: string
    addedAt: string
}

export function FriendsView() {
    const { user } = useAuth()
    const [friends, setFriends] = useState<Friend[]>([])
    const [friendCode, setFriendCode] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const fetchFriends = async () => {
        if (!user) return
        setIsLoading(true)
        try {
            const res = await fetch(`/api/friends?userId=${user.id}`)
            if (res.ok) {
                const data = await res.json()
                setFriends(data.friends || [])
            }
        } catch (error) {
            console.error("Failed to fetch friends", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchFriends()
    }, [user])

    const handleAddFriend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!friendCode.trim() || !user) return

        setIsAdding(true)
        setError("")
        setSuccess("")

        try {
            const res = await fetch("/api/friends", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, friendCode: friendCode.trim() })
            })
            const data = await res.json()

            if (res.ok) {
                setSuccess(data.message)
                setFriendCode("")
                fetchFriends() // Refresh list
            } else {
                setError(data.error)
            }
        } catch (err) {
            setError("Error al agregar amigo")
        } finally {
            setIsAdding(false)
        }
    }

    const handleRemoveFriend = async (friendId: string) => {
        if (!user || !confirm("¿Estas seguro de eliminar a este amigo?")) return

        try {
            const res = await fetch("/api/friends", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, friendId })
            })

            if (res.ok) {
                fetchFriends()
            } else {
                alert("Error al eliminar amigo")
            }
        } catch (error) {
            alert("Error al conectar con servidor")
        }
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            {/* Search / Add Friend Header */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex justify-center items-center h-10 w-10 text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 rounded-lg">
                            <UserPlus className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-display text-lg font-bold text-[hsl(var(--foreground))]">Añadir amigo</h2>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Ingresa el código de 8 caracteres</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleAddFriend} className="flex gap-3">
                    <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        </div>
                        <Input
                            value={friendCode}
                            onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                            placeholder="PB-XXXX-HN"
                            className="pl-10 h-12 uppercase text-[hsl(var(--foreground))] bg-[hsl(var(--background))] border-[hsl(var(--border))]"
                            maxLength={10}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={!friendCode.trim() || isAdding}
                        className="h-12 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(150,80%,38%)]"
                    >
                        {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : "Añadir"}
                    </Button>
                </form>

                {error && <p className="mt-3 text-sm text-[hsl(var(--destructive))]">{error}</p>}
                {success && <p className="mt-3 text-sm text-[hsl(var(--primary))]">{success}</p>}
            </div>

            {/* Friends List */}
            <div>
                <div className="mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                    <h3 className="font-display text-lg font-semibold text-[hsl(var(--foreground))]">Mis amigos ({friends.length})</h3>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
                    </div>
                ) : friends.length === 0 ? (
                    <div className="rounded-xl border border-[hsl(var(--border))] border-dashed p-8 text-center text-[hsl(var(--muted-foreground))]">
                        No has agregado a ningún amigo todavía.
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {friends.map((friend) => (
                            <div
                                key={friend.id}
                                className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 hover:border-[hsl(var(--primary))]/30 transition-colors"
                            >
                                <div>
                                    <p className="font-semibold text-[hsl(var(--foreground))]">{friend.name || "Usuario Desconocido"}</p>
                                    <p className="text-sm font-mono text-[hsl(var(--muted-foreground))]">{friend.code}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFriend(friend.id)}
                                    className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--destructive))]/10 hover:text-[hsl(var(--destructive))] transition-colors"
                                    aria-label="Eliminar amigo"
                                >
                                    <UserMinus className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
