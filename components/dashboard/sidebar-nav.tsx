'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  LayoutDashboard,
  Zap,
  History,
  Wallet,
  Shield,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';

type SidebarNavProps = {
  currentView: string;
  onNavigate: (view: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
};

const navItems = [
  { id: 'matches', label: 'Partidos', icon: LayoutDashboard },
  { id: 'my-bets', label: 'Mis apuestas', icon: Zap },
  { id: 'history', label: 'Historial', icon: History },
  { id: 'wallet', label: 'Billetera', icon: Wallet },
  { id: 'friends', label: 'Amigos', icon: Users },
  { id: 'challenge', label: 'Reto directo', icon: Shield },
  { id: 'risk', label: 'Mi nivel de riesgo', icon: Shield },
  { id: 'profile', label: 'Perfil', icon: User },
];

export function SidebarNav({
  currentView,
  onNavigate,
  collapsed,
  onToggleCollapse,
  onLogout,
}: SidebarNavProps) {
  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className='flex h-16 items-center justify-between border-b border-[hsl(var(--border))] px-4'>
        {!collapsed && (
          <div className='flex items-center gap-2'>
            <Image
              src="/Logo.png"
              alt="Al Tiro Logo"
              width={32}
              height={32}
              className="rounded-lg object-contain"
            />
            <span className='font-display text-lg font-bold text-[hsl(var(--foreground))]'>
              Al Tiro
            </span>
          </div>
        )}
        {collapsed && (
          <Image
            src="/Logo.png"
            alt="Al Tiro Logo"
            width={32}
            height={32}
            className="mx-auto rounded-lg object-contain"
          />
        )}
      </div>

      {/* Navigation */}
      <nav className='flex-1 space-y-1 p-3'>
        {navItems.map((item) => (
          <button
            key={item.id}
            type='button'
            onClick={() => onNavigate(item.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
              currentView === item.id
                ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]',
              collapsed && 'justify-center px-2',
            )}
          >
            <item.icon className='h-5 w-5 shrink-0' />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className='border-t border-[hsl(var(--border))] p-3'>
        <button
          type='button'
          onClick={onToggleCollapse}
          className='flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'
          aria-label={collapsed ? 'Expandir menu' : 'Colapsar menu'}
        >
          {collapsed ? (
            <ChevronRight className='h-4 w-4' />
          ) : (
            <ChevronLeft className='h-4 w-4' />
          )}
          {!collapsed && <span>Colapsar</span>}
        </button>
        <button
          type='button'
          onClick={onLogout}
          className={cn(
            'mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[hsl(var(--destructive))] transition-colors hover:bg-[hsl(var(--destructive))]/10',
            collapsed && 'justify-center px-2',
          )}
        >
          <LogOut className='h-5 w-5 shrink-0' />
          {!collapsed && <span>Cerrar sesion</span>}
        </button>
      </div>
    </aside>
  );
}
