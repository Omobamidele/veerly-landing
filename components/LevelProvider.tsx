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
  PATH_STORAGE_KEY,
  parseLevel,
  parsePath,
  pathLabel,
  pathMeta,
  type CareerPath,
  type LevelId,
} from "@/lib/levels";
import { parseLevelSource, type LevelSource } from "@/lib/quiz";

const SOURCE_STORAGE_KEY = "veerly.levelSource";

type LevelState = {
  path: CareerPath | null;
  pathLabel: string | null;
  pathSlug: string | null;
  level: LevelId | null;
  /** How the level was chosen: the quiz, or picked directly. */
  levelSource: LevelSource | null;
  label: string | null;
  ready: boolean;
  setPath: (path: CareerPath) => void;
  setLevel: (level: LevelId, source?: LevelSource) => void;
  setPlan: (path: CareerPath, level: LevelId, source?: LevelSource) => void;
};

const Ctx = createContext<LevelState | null>(null);

function writeUrl(path: CareerPath | null, level: LevelId | null) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const meta = path ? pathMeta(path) : null;
  if (meta) url.searchParams.set("path", meta.slug);
  else url.searchParams.delete("path");
  if (level) url.searchParams.set("level", level);
  else url.searchParams.delete("level");
  window.history.replaceState(
    null,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

export function LevelProvider({ children }: { children: React.ReactNode }) {
  const [path, setPathState] = useState<CareerPath | null>(null);
  const [level, setLevelState] = useState<LevelId | null>(null);
  const [levelSource, setLevelSource] = useState<LevelSource | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrlPath = parsePath(params.get("path"));
    const fromUrlLevel = parseLevel(params.get("level"));
    let savedPath: string | null = null;
    let savedLevel: string | null = null;
    let savedSource: string | null = null;
    try {
      savedPath = localStorage.getItem(PATH_STORAGE_KEY);
      savedLevel = localStorage.getItem(LEVEL_STORAGE_KEY);
      savedSource = localStorage.getItem(SOURCE_STORAGE_KEY);
    } catch {}
    const nextPath = fromUrlPath ?? parsePath(savedPath);
    const nextLevel = fromUrlLevel ?? parseLevel(savedLevel);
    if (nextPath) setPathState(nextPath);
    if (nextLevel) {
      setLevelState(nextLevel);
      // A level from the link or an older visit counts as picked directly unless the quiz saved it.
      setLevelSource(fromUrlLevel ? "manual" : (parseLevelSource(savedSource) ?? "manual"));
    }
    if (nextPath || nextLevel) writeUrl(nextPath, nextLevel);
    setReady(true);
  }, []);

  const persist = useCallback(
    (
      nextPath: CareerPath | null,
      nextLevel: LevelId | null,
      source?: LevelSource,
    ) => {
      try {
        if (nextPath) localStorage.setItem(PATH_STORAGE_KEY, nextPath);
        if (nextLevel) localStorage.setItem(LEVEL_STORAGE_KEY, nextLevel);
        if (source) localStorage.setItem(SOURCE_STORAGE_KEY, source);
      } catch {}
      writeUrl(nextPath, nextLevel);
    },
    [],
  );

  const setPath = useCallback(
    (next: CareerPath) => {
      setPathState(next);
      persist(next, level);
    },
    [level, persist],
  );

  const setLevel = useCallback(
    (next: LevelId, source: LevelSource = "manual") => {
      setLevelState(next);
      setLevelSource(source);
      persist(path, next, source);
    },
    [path, persist],
  );

  const setPlan = useCallback(
    (nextPath: CareerPath, nextLevel: LevelId, source: LevelSource = "manual") => {
      setPathState(nextPath);
      setLevelState(nextLevel);
      setLevelSource(source);
      persist(nextPath, nextLevel, source);
    },
    [persist],
  );

  const meta = path ? pathMeta(path) : null;
  return (
    <Ctx.Provider
      value={{
        path,
        pathLabel: meta?.label ?? pathLabel(path),
        pathSlug: meta?.slug ?? null,
        level,
        levelSource: level ? levelSource : null,
        label: level ? LEVEL_LABEL[level] : null,
        ready,
        setPath,
        setLevel,
        setPlan,
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
