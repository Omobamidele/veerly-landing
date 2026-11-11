"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  LEVEL_LABEL,
  LEVEL_STORAGE_KEY,
  parseLevel,
  type VaLevel,
} from "@/lib/levels";

type LevelState = {
  level: VaLevel | null;
  label: string | null;
  setLevel: (level: VaLevel) => void;
};

const Ctx = createContext<LevelState | null>(null);

function writeUrl(level: VaLevel) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("level", level);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

export function LevelProvider({ children }: { children: React.ReactNode }) {
  const [level, setState] = useState<VaLevel | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = parseLevel(params.get("level"));
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(LEVEL_STORAGE_KEY);
    } catch {}
    const next = fromUrl ?? parseLevel(saved);
    if (next) {
      setState(next);
      if (!fromUrl) writeUrl(next);
    }
  }, []);

  const setLevel = useCallback((next: VaLevel) => {
    setState(next);
    try {
      localStorage.setItem(LEVEL_STORAGE_KEY, next);
    } catch {}
    writeUrl(next);
  }, []);

  return (
    <Ctx.Provider
      value={{
        level,
        label: level ? LEVEL_LABEL[level] : null,
        setLevel,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useLevel() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLevel must be used inside LevelProvider");
  return v;
}
