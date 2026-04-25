import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeName = "mono" | "playful";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "studio-theme";

const getInitial = (): ThemeName => {
  if (typeof window === "undefined") return "mono";
  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeName | null;
  return stored === "playful" || stored === "mono" ? stored : "mono";
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeName>(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = "light";
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (t: ThemeName) => setThemeState(t);
  const toggleTheme = () => setThemeState((prev) => (prev === "mono" ? "playful" : "mono"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
