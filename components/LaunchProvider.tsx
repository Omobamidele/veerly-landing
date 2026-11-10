"use client";

import { createContext, useContext, useEffect, useState } from "react";

type LaunchState = {
  launchAtMs: number;
  now: number | null;
  launched: boolean;
  label: string;
  shortLabel: string;
};
const Ctx = createContext<LaunchState | null>(null);

export function LaunchProvider({
  launchAtIso,
  label,
  shortLabel,
  initialLaunched,
  forced,
  serverNow,
  children,
}: {
  launchAtIso: string;
  label: string;
  shortLabel: string;
  initialLaunched: boolean;
  /** "launched" | "prelaunch" from ?preview= or env; null = follow the clock */
  forced: "launched" | "prelaunch" | null;
  /** Request time from the server, so the first paint already shows real numbers. */
  serverNow?: number;
  children: React.ReactNode;
}) {
  const launchAtMs = new Date(launchAtIso).getTime();
  const [now, setNow] = useState<number | null>(serverNow ?? null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const launched = forced
    ? forced === "launched"
    : now === null
      ? initialLaunched
      : now >= launchAtMs;
  return (
    <Ctx.Provider value={{ launchAtMs, now, launched, label, shortLabel }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLaunch() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLaunch must be used inside LaunchProvider");
  return v;
}

/** Renders children only in the given state. */
export function WhenLaunched({
  children,
  not = false,
}: {
  children: React.ReactNode;
  not?: boolean;
}) {
  const { launched } = useLaunch();
  return <>{launched !== not ? children : null}</>;
}
