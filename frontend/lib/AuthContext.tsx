"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api, setToken, clearToken, getToken } from "./api";

export interface AuthUser { id: string; name: string; email: string; role: "admin" | "customer"; }
interface Ctx {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (e: string, p: string) => Promise<{ error?: string }>;
  register: (n: string, e: string, p: string, ph?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const C = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    if (!getToken()) { setLoading(false); return; }
    try {
      const r = await api.get("/auth/me");
      if (r.ok) { const d = await r.json(); setUser(d.user); }
      else { clearToken(); }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email: string, password: string) => {
    const r = await api.post("/auth/login", { email, password });
    const d = await r.json();
    if (r.ok) { setToken(d.token); setUser(d.user); return {}; }
    return { error: d.error };
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const r = await api.post("/auth/register", { name, email, password, phone });
    const d = await r.json();
    if (r.ok) { setToken(d.token); setUser(d.user); return {}; }
    return { error: d.error };
  };

  const logout = async () => {
    await api.post("/auth/logout", {});
    clearToken();
    setUser(null);
  };

  return (
    <C.Provider value={{ user, loading, isAdmin: user?.role === "admin", login, register, logout }}>
      {children}
    </C.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(C);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
};
