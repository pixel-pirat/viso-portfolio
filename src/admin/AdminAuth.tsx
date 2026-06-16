import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { authApi, setToken, clearToken, getToken } from "@/lib/api";

export type AccountRole = "admin" | "editor" | "viewer" | "client";

export type Account = {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
};

// Keep for backward compat — not used for auth anymore
export const ADMIN_PASSWORD = "studio2026";

type Session = { id: string; email: string; name: string; role: AccountRole } | null;

type AuthCtx = {
  isAuthed: boolean;
  session: Session;
  isAdmin: boolean;
  /** Log in via the API (cookie-based). Returns error string on failure. */
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  /** Legacy password gate — kept for backward compat, just calls login with admin creds */
  legacyLogin: (password: string) => Promise<boolean>;
  signup: (input: { name: string; email: string; password: string; role?: AccountRole }) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  /** Kept for compat — returns empty array since accounts are now server-side */
  accounts: Account[];
};

const Ctx = createContext<AuthCtx | null>(null);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);

  // On mount — restore session from token in sessionStorage
  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then((user) => {
        setSession({ id: user.id, email: user.email, name: user.name, role: user.role as AccountRole });
      })
      .catch(() => {
        clearToken();
        setSession(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Listen for 401 events from api.ts
  useEffect(() => {
    const handler = () => { setSession(null); };
    window.addEventListener("studio:unauthorized", handler);
    return () => window.removeEventListener("studio:unauthorized", handler);
  }, []);

  const login: AuthCtx["login"] = useCallback(async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      setToken(res.token); // store in sessionStorage + memory
      const u = res.user;
      setSession({ id: u.id, email: u.email, name: u.name, role: u.role as AccountRole });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: (err as Error).message || "Login failed" };
    }
  }, []);

  const legacyLogin = useCallback(async (password: string) => {
    if (password !== ADMIN_PASSWORD) return false;
    const result = await login("alex@studio.com", password);
    return result.ok;
  }, [login]);

  const signup: AuthCtx["signup"] = useCallback(async ({ name, email, password, role = "client" }) => {
    if (!name.trim()) return { ok: false, error: "Name is required." };
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return { ok: false, error: "Enter a valid email." };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
    try {
      const res = await authApi.register(name, email, password);
      setToken(res.token);
      const u = res.user;
      setSession({ id: u.id, email: u.email, name: u.name, role: u.role as AccountRole });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: (err as Error).message || "Registration failed" };
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    setSession(null);
  }, []);

  if (loading) {
    // Prevent flash of unauthenticated content while checking session
    return null;
  }

  const isAuthed = !!session;
  const isAdmin = session?.role === "admin" || session?.role === "editor";

  return (
    <Ctx.Provider value={{ isAuthed, session, isAdmin, login, legacyLogin, signup, logout, accounts: [] }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAuth must be inside AdminAuthProvider");
  return ctx;
};
