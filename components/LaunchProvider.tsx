"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { pickCountdownTarget, type CountdownTarget } from "@/lib/cohorts";
import { phaseAt, type Cohort, type Phase } from "@/lib/launch";

type LaunchState = {
  now: number | null;
  /** prelaunch / promo (countdown to enrolment, waitlist only) → enrol (checkout open, countdown to next cohort). */
  phase: Phase;
  /** True once enrolment/payment is open (the enrol phase). */
  launched: boolean;
  promoAtMs: number;
  enrolAtMs: number;
  /** Enrolment opening, e.g. "1 January 2027, 9:00 AM WAT". */
  label: string;
  /** Enrolment opening, short, e.g. "1 Jan". */
  shortLabel: string;
  /** What the countdown counts to: enrolment until doors open, then the next cohort. */
  target: CountdownTarget | null;
};
const Ctx = createContext<LaunchState | null>(null);

export function LaunchProvider({
  promoAtIso,
  enrolAtIso,
  cohorts,
  label,
  shortLabel,
  initialPhase,
  forced,
  serverNow,
  children,
}: {
  promoAtIso: string;
  enrolAtIso: string;
  cohorts: Cohort[];
  label: string;
  shortLabel: string;
  initialPhase: Phase;
  /** Phase forced by ?preview= or NEXT_PUBLIC_LAUNCH_STATE; null = follow the clock. */
  forced: Phase | null;
  /** Request time from the server, so the first paint already shows real numbers. */
  serverNow?: number;
  children: React.ReactNode;
}) {
  const promoAtMs = new Date(promoAtIso).getTime();
  const enrolAtMs = new Date(enrolAtIso).getTime();
  const [now, setNow] = useState<number | null>(serverNow ?? null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const phase: Phase =
    forced ??
    (now === null ? initialPhase : phaseAt(now, promoAtMs, enrolAtMs));
  return (
    <Ctx.Provider
      value={{
        now,
        phase,
        launched: phase === "enrol",
        promoAtMs,
        enrolAtMs,
        label,
        shortLabel,
        target: pickCountdownTarget({
          now: now ?? serverNow ?? promoAtMs,
          promoAtMs,
          enrolAtMs,
          phase,
          cohorts,
        }),
      }}
    >
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
