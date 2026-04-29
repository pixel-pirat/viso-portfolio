import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const KEY = "studio:admin:auth";
// ⚠️ Demo-only password gate. Change here.
export const ADMIN_PASSWORD = "studio2026";

type AuthCtx = {
  isAuthed: boolean;
  login: (pw: string) => boolean;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(KEY) === "1");
  }, []);

  const login = (pw: string) => {
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem(KEY, "1");
      setAuthed(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(KEY);
    setAuthed(false);
  };

  return <Ctx.Provider value={{ isAuthed, login, logout }}>{children}</Ctx.Provider>;
};

export const useAdminAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAuth must be inside AdminAuthProvider");
  return ctx;
};
