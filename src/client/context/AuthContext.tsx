import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { SessionUser } from '../services/api';
import { checkOneUnusuSession } from '../services/api';

const ONE_UNUSU_URL = import.meta.env.VITE_ONE_UNUSU_URL || 'http://localhost:5173';
const SSO_CLIENT_ID = import.meta.env.VITE_SSO_CLIENT_ID || 'e538eac90fb83578';

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  saveSession: (token: string, user: SessionUser) => void;
  logout: () => void;
}

const TOKEN_KEY = 'esurat_unusu_token';
const USER_KEY = 'esurat_unusu_user';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Logout di E-Surat HANYA membersihkan sesi lokal. Sesi di ONE UNUSU tetap aktif.
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const raw = localStorage.getItem(USER_KEY);

      if (!token || !raw) {
        if (!cancelled) setLoading(false);
        return;
      }

      let cachedUser: SessionUser | null = null;
      try {
        cachedUser = JSON.parse(raw) as SessionUser;
        if (!cancelled) setUser(cachedUser);
      } catch {
        localStorage.removeItem(USER_KEY);
      }

      try {
        // Sinkronisasi status sesi dengan Identity Provider ONE UNUSU
        const ssoStatus = await checkOneUnusuSession();

        // Kasus A: Sesi pusat ONE UNUSU tidak terdeteksi
        if (ssoStatus?.authenticated === false) {
          // Pertahankan sesi lokal yang valid agar tidak terjadi infinite login loop
          console.warn('[SSO] Sesi ONE UNUSU tidak terdeteksi, mempertahankan sesi lokal E-Surat.');
        } else if (
          ssoStatus?.authenticated === true &&
          ssoStatus.user?.username &&
          cachedUser?.username &&
          ssoStatus.user.username.toLowerCase() !== cachedUser.username.toLowerCase()
        ) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          if (!cancelled) {
            setUser(null);
            setLoading(false);
          }
          window.location.replace(
            `${ONE_UNUSU_URL}/authorize?client_id=${encodeURIComponent(SSO_CLIENT_ID)}`
          );
          return;
        }
      } catch {
        // Abaikan kegagalan jaringan saat offline
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const saveSession = (token: string, sessionUser: SessionUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, saveSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider');
  }
  return context;
}
