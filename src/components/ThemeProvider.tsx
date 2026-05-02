import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeName = "mono" | "mono-dark" | "playful";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "studio-theme";
const ORDER: ThemeName[] = ["mono", "mono-dark", "playful"];

const getInitial = (): ThemeName => {
  if (typeof window === "undefined") return "mono";
  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeName | null;
  if (stored && ORDER.includes(stored)) return stored;
  return "mono";
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeName>(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme === "mono-dark" ? "dark" : "light";
    // Keep the `dark` class in sync for any tailwind dark: utilities.
    if (theme === "mono-dark") root.classList.add("dark");
    else root.classList.remove("dark");
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (t: ThemeName) => setThemeState(t);
  const toggleTheme = () =>
    setThemeState((prev) => ORDER[(ORDER.indexOf(prev) + 1) % ORDER.length]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === "mono-dark" }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
