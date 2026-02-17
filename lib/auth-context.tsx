'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { AuthService } from '../configuration/services/AuthService';

export type User = {
  id: string;
  name: string;
  email: string;
  code: string;
  balance: number;
  kycVerified: boolean;
  createdAt: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateBalance: (amount: number) => void;
  refreshBalance: () => Promise<void>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  googleError: string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

function generateCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `PB-${num}-HN`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [googleError, setGoogleError] = useState<string | null>(null);
  // Google Auth
  const signInWithGoogle = useCallback(async () => {
    setGoogleError(null);
    const result = await AuthService.signInWithGoogle();
    if (result && result.err) {
      const errMsg = (result.err as any)?.message || 'Error al iniciar sesión con Google';
      setGoogleError(errMsg);
      return { success: false, error: errMsg };
    } else if (result && result.user) {
      const email = result.user.email || '';
      const name = result.user.displayName || '';

      try {
        const res = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name }),
        });

        if (!res.ok) {
          const errMsg = 'No se pudo sincronizar el usuario con la base de datos';
          setGoogleError(errMsg);
          return { success: false, error: errMsg };
        }

        const data = await res.json();
        const dbUser = data?.user;

        if (!dbUser) {
          const errMsg = 'Respuesta invalida del servidor';
          setGoogleError(errMsg);
          return { success: false, error: errMsg };
        }

        const googleUser = {
          id: dbUser.id,
          name: dbUser.name || name,
          email: dbUser.email || email,
          code: dbUser.code,
          balance: Number(dbUser.balance ?? 0),
          kycVerified: Boolean(dbUser.kycVerified),
          createdAt: dbUser.createdAt || new Date().toISOString(),
        };

        setUser(googleUser);
        localStorage.setItem('peerbet_user', JSON.stringify(googleUser));
        return { success: true };
      } catch (error) {
        const errMsg = 'Error al conectar con el servidor';
        setGoogleError(errMsg);
        return { success: false, error: errMsg };
      }
    }
    return { success: false, error: 'Error desconocido' };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('peerbet_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('peerbet_user');
      }
    }
    setIsLoading(false);
  }, []);

  const saveUser = useCallback((u: User) => {
    setUser(u);
    localStorage.setItem('peerbet_user', JSON.stringify(u));
  }, []);

  const login = useCallback(
    async (
      email: string,
      _password: string,
    ): Promise<{ success: boolean; error?: string }> => {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 800));

      const usersRaw = localStorage.getItem('peerbet_users');
      const users: Array<User & { password: string }> = usersRaw
        ? JSON.parse(usersRaw)
        : [];
      const found = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );

      if (!found) {
        return {
          success: false,
          error: 'No existe una cuenta con ese correo.',
        };
      }

      if (found.password !== _password) {
        return { success: false, error: 'Contrasena incorrecta.' };
      }

      const { password: _, ...userData } = found;
      saveUser(userData);
      return { success: true };
    },
    [saveUser],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
    ): Promise<{ success: boolean; error?: string }> => {
      await new Promise((r) => setTimeout(r, 800));

      const usersRaw = localStorage.getItem('peerbet_users');
      const users: Array<User & { password: string }> = usersRaw
        ? JSON.parse(usersRaw)
        : [];

      if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return {
          success: false,
          error: 'Ya existe una cuenta con ese correo.',
        };
      }

      const newUser: User & { password: string } = {
        id: crypto.randomUUID(),
        name,
        email,
        password,
        code: generateCode(),
        balance: 5000,
        kycVerified: false,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem('peerbet_users', JSON.stringify(users));

      const { password: _, ...userData } = newUser;
      saveUser(userData);
      return { success: true };
    },
    [saveUser],
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('peerbet_user');
    localStorage.removeItem('peerbet_bets');
  }, []);

  const updateBalance = useCallback((amount: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, balance: prev.balance + amount };
      localStorage.setItem('peerbet_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/wallet?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setUser((prev) => {
          if (!prev) return prev;
          const updated = { ...prev, balance: data.balance };
          localStorage.setItem('peerbet_user', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateBalance,
        refreshBalance,
        signInWithGoogle,
        googleError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
