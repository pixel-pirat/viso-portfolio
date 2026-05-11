import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { StudioState } from "./types";
import { seedState } from "./seed";

const STORAGE_KEY = "studio:state:v2";

type Ctx = {
  state: StudioState;
  setState: (updater: (s: StudioState) => StudioState) => void;
  reset: () => void;
};

const StudioContext = createContext<Ctx | null>(null);

function loadState(): StudioState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState;
    const parsed = JSON.parse(raw) as Partial<StudioState>;
    // Shallow merge with seed to be resilient to schema additions
    return { ...seedState, ...parsed } as StudioState;
  } catch {
    return seedState;
  }
}

export const StudioProvider = ({ children }: { children: ReactNode }) => {
  const [state, setStateInternal] = useState<StudioState>(() => loadState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const setState = useCallback((updater: (s: StudioState) => StudioState) => {
    setStateInternal((prev) => updater(prev));
  }, []);

  const reset = useCallback(() => setStateInternal(seedState), []);

  const value = useMemo(() => ({ state, setState, reset }), [state, setState, reset]);

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
};

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used within StudioProvider");
  return ctx;
}

export const uid = () => Math.random().toString(36).slice(2, 10);
