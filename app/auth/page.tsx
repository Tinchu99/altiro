'use client';

import React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Users,
  Zap,
} from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, signInWithGoogle, googleError } = useAuth();
  // Google sign-in handler
  async function handleGoogleSignIn() {
    const result = await signInWithGoogle();
    if (result.success) {
      router.push('/dashboard');
    } else if (result.error) {
      setError(result.error);
    }
  }
  // ...existing code...

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(email, password);
        if (result.success) {
          router.push('/dashboard');
        } else {
          setError(result.error || 'Error al iniciar sesion');
        }
      } else {
        if (!name.trim()) {
          setError('Ingresa tu nombre completo');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('La contrasena debe tener al menos 6 caracteres');
          setLoading(false);
          return;
        }
        const result = await register(name, email, password);
        if (result.success) {
          router.push('/dashboard');
        } else {
          setError(result.error || 'Error al registrarse');
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex min-h-screen'>
      {/* Left panel - Form */}
      <div className='flex flex-1 flex-col justify-center px-6 py-12 lg:px-12'>
        <div className='mx-auto w-full max-w-md'>
          {/* Google Sign-In */}
          <div className='mb-4'>
            <Button
              type='button'
              onClick={handleGoogleSignIn}
              className='w-full bg-red-500 hover:bg-red-600 text-white mb-2'
            >
              <svg
                className='mr-2 h-5 w-5 inline'
                viewBox='0 0 488 512'
                fill='currentColor'
              >
                <path d='M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123.1 24.5 166.3 64.9l-67.5 64.9C316.4 97.8 285.7 88 248 88c-99.7 0-180.7 81.1-180.7 180.7 0 99.7 81.1 180.7 180.7 180.7 90.6 0 148.7-51.7 162.7-124.2H248v-99.2h240c2.2 12.7 3.3 25.7 3.3 39.8z' />
              </svg>
              Continuar con Google
            </Button>
            {googleError && (
              <div className='rounded-lg bg-[hsl(var(--destructive))]/10 p-3 text-sm text-[hsl(var(--destructive))]'>
                {googleError}
              </div>
            )}
          </div>
          {/* Back button */}
          <a
            href='/'
            className='mb-8 inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]'
          >
            <ArrowLeft className='h-4 w-4' />
            Volver al inicio
          </a>

          {/* Logo */}
          <div className='mb-8 flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))]'>
              <span className='font-display text-lg font-bold text-[hsl(var(--primary-foreground))]'>
                A
              </span>
            </div>
            <span className='font-display text-2xl font-bold text-[hsl(var(--foreground))]'>
              Al Tiro
            </span>
          </div>

          {/* Title */}
          <h1 className='mb-2 font-display text-3xl font-bold text-[hsl(var(--foreground))]'>
            {mode === 'login'
              ? 'Bienvenido de vuelta'
              : 'Crea tu cuenta gratis'}
          </h1>
          <p className='mb-8 text-[hsl(var(--muted-foreground))]'>
            {mode === 'login'
              ? 'Ingresa tus datos para acceder a tu cuenta'
              : 'Registrate y recibe L. 5,000 de bono para empezar'}
          </p>

          {/* Toggle */}
          <div className='mb-6 flex rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-1'>
            <button
              type='button'
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={cn(
                'flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all',
                mode === 'login'
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm'
                  : 'text-[hsl(var(--muted-foreground))]',
              )}
            >
              Iniciar sesion
            </button>
            <button
              type='button'
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={cn(
                'flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all',
                mode === 'register'
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm'
                  : 'text-[hsl(var(--muted-foreground))]',
              )}
            >
              Registrarse
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            {mode === 'register' && (
              <div>
                <label
                  htmlFor='name'
                  className='mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]'
                >
                  Nombre completo
                </label>
                <Input
                  id='name'
                  placeholder='Juan Hernandez'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className='h-12 border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]'
                  required
                />
              </div>
            )}

            <div>
              <label
                htmlFor='email'
                className='mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]'
              >
                Correo electronico
              </label>
              <Input
                id='email'
                type='email'
                placeholder='juan@ejemplo.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='h-12 border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]'
                required
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]'
              >
                Contrasena
              </label>
              <div className='relative'>
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder={
                    mode === 'register'
                      ? 'Minimo 6 caracteres'
                      : 'Tu contrasena'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='h-12 border-[hsl(var(--border))] bg-[hsl(var(--background))] pr-12 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  aria-label={
                    showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'
                  }
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className='rounded-lg bg-[hsl(var(--destructive))]/10 p-3 text-sm text-[hsl(var(--destructive))]'>
                {error}
              </div>
            )}

            <Button
              type='submit'
              disabled={loading}
              className='h-12 w-full bg-[hsl(var(--primary))] font-display text-base text-[hsl(var(--primary-foreground))] hover:bg-[hsl(150,80%,38%)] disabled:opacity-50'
            >
              {loading ? (
                <Loader2 className='h-5 w-5 animate-spin' />
              ) : mode === 'login' ? (
                'Iniciar sesion'
              ) : (
                'Crear cuenta gratis'
              )}
            </Button>
          </form>

          {mode === 'register' && (
            <p className='mt-4 text-center text-xs text-[hsl(var(--muted-foreground))]'>
              Al registrarte aceptas los Terminos de Servicio y la Politica de
              Privacidad de Al tiro. Licencia de operacion emitida en Curazao.
            </p>
          )}
        </div>
      </div>

      {/* Right panel - Visual */}
      <div className='hidden flex-col justify-center bg-[hsl(var(--card))] p-12 lg:flex lg:w-[480px]'>
        <div className='space-y-8'>
          <div>
            <h2 className='mb-2 font-display text-2xl font-bold text-[hsl(var(--foreground))]'>
              Apuestas P2P reales
            </h2>
            <p className='text-[hsl(var(--muted-foreground))]'>
              La unica plataforma donde compites contra otros usuarios, no
              contra la casa.
            </p>
          </div>

          <div className='space-y-4'>
            <div className='flex items-start gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10'>
                <Shield className='h-5 w-5 text-[hsl(var(--primary))]' />
              </div>
              <div>
                <p className='font-medium text-[hsl(var(--foreground))]'>
                  Motor anti-colusion
                </p>
                <p className='text-sm text-[hsl(var(--muted-foreground))]'>
                  IA que detecta patrones sospechosos en tiempo real
                </p>
              </div>
            </div>

            <div className='flex items-start gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--accent))]/10'>
                <Users className='h-5 w-5 text-[hsl(var(--accent))]' />
              </div>
              <div>
                <p className='font-medium text-[hsl(var(--foreground))]'>
                  Verificacion KYC
                </p>
                <p className='text-sm text-[hsl(var(--muted-foreground))]'>
                  DNI + biometria para maxima seguridad
                </p>
              </div>
            </div>

            <div className='flex items-start gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10'>
                <Zap className='h-5 w-5 text-[hsl(var(--primary))]' />
              </div>
              <div>
                <p className='font-medium text-[hsl(var(--foreground))]'>
                  Bono de bienvenida
                </p>
                <p className='text-sm text-[hsl(var(--muted-foreground))]'>
                  L. 5,000 ficticios para que pruebes la plataforma
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
