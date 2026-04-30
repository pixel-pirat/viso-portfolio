import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

const SESSION_KEY = "studio:admin:session";
const ACCOUNTS_KEY = "studio:admin:accounts";

// ⚠️ Demo-only password gate (legacy quick-access). Change here.
export const ADMIN_PASSWORD = "studio2026";

export type AccountRole = "admin" | "client";

export type Account = {
  id: string;
  name: string;
  email: string;
  // ⚠️ Plaintext on purpose — this is a frontend mock. Never use in production.
  password: string;
  role: AccountRole;
  createdAt: string;
};

type Session = { id: string; email: string; name: string; role: AccountRole } | null;

type AuthCtx = {
  isAuthed: boolean;
  session: Session;
  /** True if the user is authed as admin (either via session or legacy password gate). */
  isAdmin: boolean;
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  legacyLogin: (password: string) => boolean;
  signup: (input: { name: string; email: string; password: string; role?: AccountRole }) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  accounts: Account[];
};

const Ctx = createContext<AuthCtx | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Account[];
  } catch {
    return [];
  }
}

function saveAccounts(list: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
}

function loadSession(): Session {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    if (raw === "__legacy__") {
      return { id: "legacy", email: "admin@local", name: "Admin", role: "admin" };
    }
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    setAccounts(loadAccounts());
    setSession(loadSession());
  }, []);

  const persistSession = (s: Session, legacy = false) => {
    setSession(s);
    if (legacy) sessionStorage.setItem(SESSION_KEY, "__legacy__");
    else if (s) sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else sessionStorage.removeItem(SESSION_KEY);
  };

  const login: AuthCtx["login"] = (email, password) => {
    const acct = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!acct) return { ok: false, error: "No account with that email." };
    if (acct.password !== password) return { ok: false, error: "Wrong password." };
    persistSession({ id: acct.id, email: acct.email, name: acct.name, role: acct.role });
    return { ok: true };
  };

  const legacyLogin = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      persistSession({ id: "legacy", email: "admin@local", name: "Admin", role: "admin" }, true);
      return true;
    }
    return false;
  };

  const signup: AuthCtx["signup"] = ({ name, email, password, role = "client" }) => {
    const e = email.trim().toLowerCase();
    if (!name.trim()) return { ok: false, error: "Name is required." };
    if (!/^\S+@\S+\.\S+$/.test(e)) return { ok: false, error: "Enter a valid email." };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
    if (accounts.some((a) => a.email.toLowerCase() === e)) return { ok: false, error: "An account with that email already exists." };
    const acct: Account = { id: uid(), name: name.trim(), email: e, password, role, createdAt: new Date().toISOString() };
    const next = [acct, ...accounts];
    setAccounts(next);
    saveAccounts(next);
    persistSession({ id: acct.id, email: acct.email, name: acct.name, role: acct.role });
    return { ok: true };
  };

  const logout = useCallback(() => persistSession(null), []);

  const isAuthed = !!session;
  const isAdmin = session?.role === "admin";

  return (
    <Ctx.Provider value={{ isAuthed, session, isAdmin, login, legacyLogin, signup, logout, accounts }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAuth must be inside AdminAuthProvider");
  return ctx;
};
