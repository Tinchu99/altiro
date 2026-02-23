"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/Logo.png"
            alt="Al Tiro Logo"
            width={36}
            height={36}
            className="rounded-lg object-contain"
          />
          <span className="font-display text-xl font-bold text-[hsl(var(--foreground))]">Al tiro</span>
        </div>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#como-funciona" className="text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]">
            Como funciona
          </a>
          <a href="#ligas" className="text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]">
            Ligas
          </a>
          <a href="#seguridad" className="text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]">
            Seguridad
          </a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(150,80%,38%)]"
            >
              Ir al Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => router.push("/auth")}
                className="text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]"
              >
                Iniciar sesion
              </Button>
              <Button
                onClick={() => router.push("/auth")}
                className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(150,80%,38%)]"
              >
                Registrarse
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="text-[hsl(var(--foreground))] md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-6 md:hidden">
          <div className="flex flex-col gap-4">
            <a href="#como-funciona" className="text-sm text-[hsl(var(--muted-foreground))]">Como funciona</a>
            <a href="#ligas" className="text-sm text-[hsl(var(--muted-foreground))]">Ligas</a>
            <a href="#seguridad" className="text-sm text-[hsl(var(--muted-foreground))]">Seguridad</a>
            <hr className="border-[hsl(var(--border))]" />
            {user ? (
              <Button onClick={() => router.push("/dashboard")} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
                Ir al Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => router.push("/auth")} className="justify-start text-[hsl(var(--muted-foreground))]">
                  Iniciar sesion
                </Button>
                <Button onClick={() => router.push("/auth")} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
                  Registrarse
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
