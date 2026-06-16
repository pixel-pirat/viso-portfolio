import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { authApi, usersApi } from "@/lib/api";

export type AccountRole = "admin" | "editor" | "viewer" | "client";

export type Account = {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
  createdAt?: string;
};

type Session = { id: string; email: string; name: string; role: AccountRole } | null;

type AuthCtx = {
  isAuthed: boolean;
  session: Session;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signup: (input: { name: string; email: string; password: string; role?: AccountRole }) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  accounts: Account[];
  refreshAccounts: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    try {
      const list = await usersApi.list() as Account[];
      setAccounts(list);
    } catch (err) {
      console.error("Failed to fetch users list", err);
    }
  }, []);

  const checkSession = useCallback(async () => {
    setLoading(true);
    try {
      const user = await authApi.me();
      const mappedSession: Session = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as AccountRole,
      };
      setSession(mappedSession);
      if (user.role === "admin" || user.role === "editor") {
        await fetchAccounts();
      }
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [fetchAccounts]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email: string, password: string) => {
    try {
      const res = await authApi.login(email, password);
      const mappedSession: Session = {
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        role: res.user.role as AccountRole,
      };
      setSession(mappedSession);
      if (res.user.role === "admin" || res.user.role === "editor") {
        await fetchAccounts();
      }
      return { ok: true as const };
    } catch (err) {
      return { ok: false as const, error: (err as Error).message };
    }
  };

  const signup = async ({ name, email, password, role = "client" }: { name: string; email: string; password: string; role?: AccountRole }) => {
    try {
      const res = await authApi.register(name, email, password);
      const mappedSession: Session = {
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        role: res.user.role as AccountRole,
      };
      setSession(mappedSession);
      if (res.user.role === "admin" || res.user.role === "editor") {
        await fetchAccounts();
      }
      return { ok: true as const };
    } catch (err) {
      return { ok: false as const, error: (err as Error).message };
    }
  };

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout failed on server", err);
    }
    setSession(null);
    setAccounts([]);
  }, []);

  const isAuthed = !!session;
  const isAdmin = session?.role === "admin" || session?.role === "editor";

  return (
    <Ctx.Provider value={{
      isAuthed,
      session,
      isAdmin,
      loading,
      login,
      signup,
      logout,
      accounts,
      refreshAccounts: fetchAccounts,
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAuth must be inside AdminAuthProvider");
  return ctx;
};
