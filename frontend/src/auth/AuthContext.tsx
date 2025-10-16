import { createContext, useContext, useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_BASE as string;

type AuthCtx = {
  isAuthed: boolean;
  user: any | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({ isAuthed: false, user: null, refresh: async () => {}, logout: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  async function refresh() {
    try {
      const res = await fetch(`${API}/api/auth/me`, { credentials: 'include', cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setIsAuthed(true);
        setUser(data.user ?? null);
      } else {
        setIsAuthed(false);
        setUser(null);
      }
    } catch {
      setIsAuthed(false);
      setUser(null);
    }
  }

  async function logout() {
    await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    setIsAuthed(false);
    setUser(null);
  }

  useEffect(() => { void refresh(); }, []);

  return <Ctx.Provider value={{ isAuthed, user, refresh, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() { return useContext(Ctx); }


