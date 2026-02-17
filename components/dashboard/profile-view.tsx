"use client"

import { useAuth } from "@/lib/auth-context"
import { Badge, CheckCircle2, Copy, Fingerprint, Smartphone, CreditCard, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function ProfileView() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  if (!user) return null

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  function handleCopy() {
    navigator.clipboard.writeText(user!.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      {/* Profile header */}
      <div className="mb-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]/10">
            <span className="font-display text-3xl font-bold text-[hsl(var(--primary))]">{initials}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">
                {user.name}
              </h2>
              {user.kycVerified ? (
                <div className="flex items-center gap-1 rounded-full bg-[hsl(var(--primary))]/10 px-2.5 py-1">
                  <CheckCircle2 className="h-3 w-3 text-[hsl(var(--primary))]" />
                  <span className="text-xs font-semibold text-[hsl(var(--primary))]">Verificado</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 rounded-full bg-[hsl(var(--accent))]/10 px-2.5 py-1">
                  <Clock className="h-3 w-3 text-[hsl(var(--accent))]" />
                  <span className="text-xs font-semibold text-[hsl(var(--accent))]">Pendiente KYC</span>
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{user.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-[hsl(var(--muted-foreground))]">Codigo de usuario:</span>
              <code className="rounded bg-[hsl(var(--secondary))] px-2 py-0.5 font-mono text-xs text-[hsl(var(--foreground))]">
                {user.code}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                aria-label="Copiar codigo"
              >
                {copied ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
              Balance actual: <span className="font-semibold text-[hsl(var(--primary))]">L. {user.balance.toLocaleString()}</span>
            </p>
          </div>
        </div>
      </div>

      {/* KYC Verification */}
      <h2 className="mb-4 font-display text-lg font-semibold text-[hsl(var(--foreground))]">
        Verificacion de identidad
      </h2>

      {!user.kycVerified ? (
        <div className="mb-8 rounded-xl border border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--accent))]" />
            <div>
              <p className="font-medium text-[hsl(var(--foreground))]">Verificacion KYC pendiente</p>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Para desbloquear todas las funciones de Al tiro, completa la verificacion de identidad.
                Esto es requerido por las regulaciones AML de Curazao.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
                  <Badge className="mb-2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">1. Subir DNI</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Foto frontal y trasera</p>
                </div>
                <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
                  <Fingerprint className="mb-2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">2. Biometria</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Selfie de verificacion</p>
                </div>
                <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
                  <CreditCard className="mb-2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">3. Cuenta bancaria</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Vincular cuenta</p>
                </div>
              </div>
              <Button className="mt-4 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(38,92%,48%)]">
                Iniciar verificacion
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[hsl(var(--primary))]/20 bg-[hsl(var(--card))] p-5">
            <div className="mb-3 flex items-center gap-3">
              <Badge className="h-5 w-5 text-[hsl(var(--primary))]" />
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">DNI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[hsl(var(--primary))]" />
              <span className="text-xs text-[hsl(var(--primary))]">Verificado</span>
            </div>
          </div>
          <div className="rounded-xl border border-[hsl(var(--primary))]/20 bg-[hsl(var(--card))] p-5">
            <div className="mb-3 flex items-center gap-3">
              <Fingerprint className="h-5 w-5 text-[hsl(var(--primary))]" />
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">Biometria</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[hsl(var(--primary))]" />
              <span className="text-xs text-[hsl(var(--primary))]">Verificado</span>
            </div>
          </div>
          <div className="rounded-xl border border-[hsl(var(--primary))]/20 bg-[hsl(var(--card))] p-5">
            <div className="mb-3 flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-[hsl(var(--primary))]" />
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">Cuenta bancaria</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[hsl(var(--primary))]" />
              <span className="text-xs text-[hsl(var(--primary))]">Verificado</span>
            </div>
          </div>
        </div>
      )}

      {/* Account info */}
      <h2 className="mb-4 font-display text-lg font-semibold text-[hsl(var(--foreground))]">
        Informacion de cuenta
      </h2>
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <div>
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">Miembro desde</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {new Date(user.createdAt).toLocaleDateString("es-HN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <Smartphone className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">Este dispositivo</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Activo ahora</p>
          </div>
          <span className="text-xs text-[hsl(var(--primary))]">Principal</span>
        </div>
      </div>
    </div>
  )
}
