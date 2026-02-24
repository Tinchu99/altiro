'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BetsProvider } from '@/lib/bets-context';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { MatchesView } from '@/components/dashboard/matches-view';
import { MyBetsView } from '@/components/dashboard/my-bets-view';
import { HistoryView } from '@/components/dashboard/history-view';
import { WalletView } from '@/components/dashboard/wallet-view';
import { FriendsView } from '@/components/dashboard/friends-view';
import { RiskView } from '@/components/dashboard/risk-view';
import { ProfileView } from '@/components/dashboard/profile-view';
import { Bell, Search, Menu, X, Loader2 } from 'lucide-react';

const viewTitles: Record<string, string> = {
  matches: 'Partidos',
  'my-bets': 'Mis apuestas',
  history: 'Historial',
  wallet: 'Billetera',
  friends: 'Mis Amigos',
  risk: 'Mi nivel de riesgo',
  profile: 'Perfil',
  challenge: 'Reto directo',
};
import DirectChallenge from '@/components/dashboard/direct-challenge';

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [currentView, setCurrentView] = useState('matches');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-[hsl(var(--primary))]' />
      </div>
    );
  }

  if (!user) return null;

  function handleNavigate(view: string) {
    setCurrentView(view);
    setMobileMenuOpen(false);
  }

  function handleLogout() {
    logout();
    router.push('/');
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <BetsProvider>
      <div className='flex h-screen overflow-hidden'>
        {/* Desktop sidebar */}
        <div className='hidden md:block'>
          <SidebarNav
            currentView={currentView}
            onNavigate={handleNavigate}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            onLogout={handleLogout}
          />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div className='fixed inset-0 z-50 md:hidden'>
            <div
              className='absolute inset-0 bg-black/50'
              onClick={() => setMobileMenuOpen(false)}
              onKeyDown={(e) => e.key === 'Escape' && setMobileMenuOpen(false)}
              role='button'
              tabIndex={0}
              aria-label='Cerrar menu'
            />
            <div className='relative z-10'>
              <SidebarNav
                currentView={currentView}
                onNavigate={handleNavigate}
                collapsed={false}
                onToggleCollapse={() => setMobileMenuOpen(false)}
                onLogout={handleLogout}
              />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className='flex flex-1 flex-col overflow-hidden'>
          {/* Top bar */}
          <header className='flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 md:px-6'>
            <div className='flex items-center gap-3'>
              <button
                type='button'
                className='rounded-lg p-2 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--secondary))] md:hidden'
                onClick={() => setMobileMenuOpen(true)}
                aria-label='Abrir menu'
              >
                {mobileMenuOpen ? (
                  <X className='h-5 w-5' />
                ) : (
                  <Menu className='h-5 w-5' />
                )}
              </button>
              <h1 className='font-display text-lg font-semibold text-[hsl(var(--foreground))]'>
                {viewTitles[currentView]}
              </h1>
            </div>

            <div className='flex items-center gap-2'>
              {/* Search */}
              <div className='hidden items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 md:flex'>
                <Search className='h-4 w-4 text-[hsl(var(--muted-foreground))]' />
                <input
                  type='text'
                  placeholder='Buscar partidos...'
                  className='w-48 bg-transparent text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none'
                />
              </div>

              {/* Notifications */}
              <button
                type='button'
                className='relative rounded-lg p-2 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--secondary))]'
                aria-label='Notificaciones'
              >
                <Bell className='h-5 w-5' />
                <div className='absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[hsl(var(--live))]' />
              </button>

              {/* Balance badge */}
              <div className='hidden items-center gap-2 rounded-lg bg-[hsl(var(--primary))]/10 px-3 py-2 md:flex'>
                <span className='text-xs text-[hsl(var(--muted-foreground))]'>
                  Balance:
                </span>
                <span className='font-display text-sm font-bold text-[hsl(var(--primary))]'>
                  L. {user.balance.toLocaleString()}
                </span>
              </div>

              {/* Avatar */}
              <button
                type='button'
                onClick={() => setCurrentView('profile')}
                className='flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--secondary))] transition-colors hover:bg-[hsl(var(--primary))]/20'
              >
                <span className='text-xs font-semibold text-[hsl(var(--foreground))]'>
                  {initials}
                </span>
              </button>
            </div>
          </header>

          {/* Content */}
          <main className='flex-1 overflow-y-auto p-4 md:p-6'>
            {currentView === 'matches' && <MatchesView />}
            {currentView === 'my-bets' && <MyBetsView />}
            {currentView === 'history' && <HistoryView />}
            {currentView === 'wallet' && <WalletView />}
            {currentView === 'friends' && <FriendsView />}
            {currentView === 'challenge' && <DirectChallenge />}
            {currentView === 'risk' && <RiskView />}
            {currentView === 'profile' && <ProfileView />}
          </main>
        </div>
      </div>
    </BetsProvider>
  );
}
