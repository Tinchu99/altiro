import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { BetModes } from "@/components/landing/bet-modes"
import { Leagues } from "@/components/landing/leagues"
import { Security } from "@/components/landing/security"
import { CTA } from "@/components/landing/cta"
import Image from "next/image"

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <BetModes />
      <Leagues />
      <Security />
      <CTA />

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] px-4 py-12 md:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/Logo.png"
              alt="Al Tiro Logo"
              width={32}
              height={32}
              className="rounded-lg object-contain"
            />
            <span className="font-display text-lg font-bold text-[hsl(var(--foreground))]">Al tiro</span>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Licenciado y regulado en Curazao. Operacion con estandares AML/KYC internacionales.
          </p>
          <a href="/dashboard" className="text-sm text-[hsl(var(--primary))] hover:underline">
            Ir al Dashboard
          </a>
        </div>
      </footer>
    </main>
  )
}
