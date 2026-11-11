"use client";

import { useEffect, useState } from "react";
import { Price } from "./Currency";
import { cn } from "@/lib/utils";
import { useLaunch } from "./LaunchProvider";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}
const two = (n: number) => String(n).padStart(2, "0");

const dayLabel = (ms: number) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(ms);
const dateLabel = (ms: number) => {
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Lagos",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(ms);
  return `${dayLabel(ms)}, ${time} WAT`;
};

/** Screen readers hear an update once a minute, not every second. */
function useSpoken() {
  const { now, target } = useLaunch();
  const p = now === null || !target ? null : parts(target.atMs - now);
  const minuteKey =
    p && target ? `${target.atMs}-${p.days}-${p.hours}-${p.minutes}` : "";
  const [spoken, setSpoken] = useState("");
  useEffect(() => {
    if (!p || !target) return;
    setSpoken(
      target.kind === "enrolment"
        ? `Founding enrolment opens in ${p.days} days, ${p.hours} hours and ${p.minutes} minutes.`
        : `${target.name ?? "The next cohort"} starts in ${p.days} days, ${p.hours} hours and ${p.minutes} minutes.`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minuteKey]);
  return spoken;
}

function Tiles({
  cells,
  board,
}: {
  cells: [string, string][];
  board: boolean;
}) {
  return (
    <div
      className={cn("grid grid-cols-4", board ? "gap-2 sm:gap-3" : "gap-1.5")}
      aria-hidden="true"
    >
      {cells.map(([v, unit]) => (
        <div key={unit} className="flex flex-col gap-2" data-tile>
          <div
            className={cn(
              "flap flex items-center justify-center overflow-hidden bg-yellow text-ink shadow-[0_1px_0_rgb(255_255_255/0.45)_inset,0_-2px_0_rgb(0_43_66/0.18)_inset,0_12px_24px_-12px_rgb(0_0_0/0.6)]",
              board ? "aspect-[1/1.02] rounded-xl" : "h-16 rounded-lg",
            )}
          >
            <span
              key={unit === "Seconds" ? v : undefined}
              className={cn(
                "display tnum leading-none",
                unit === "Seconds" && "tick",
                board ? "text-[clamp(38px,4.6vw,64px)]" : "text-[34px]",
              )}
            >
              {v}
            </span>
          </div>
          <span
            className={cn(
              "text-center tracking-wide",
              board ? "text-xs text-white/85" : "text-[11px] text-white/60",
            )}
          >
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * The countdown slot. In prelaunch and promo the hero is Mo's founding-enrolment
 * panel with yellow tiles counting to ENROL_AT (1 January 2027, 9:00 AM WAT).
 * From enrol onward: the same yellow tiles on navy, counting to the next cohort
 * (lib/cohorts.ts), never zero.
 * variant "board" = the hero panel; "strip" = the compact version in the pricing band.
 */
export default function Countdown({
  variant = "board",
  className,
  cohortDay,
  withHeading = false,
}: {
  variant?: "board" | "strip";
  className?: string;
  /** Enrolment board footer, e.g. "Cohort 1 starts 1 February 2027". */
  cohortDay?: string;
  /** Strip only: show a date line above the tiles. */
  withHeading?: boolean;
}) {
  const { now, target, enrolAtMs, phase } = useLaunch();
  const spoken = useSpoken();
  const board = variant === "board";
  const atMs = target?.atMs ?? enrolAtMs;
  const p = now === null ? null : parts(atMs - now);
  const cells: [string, string][] = [
    [p ? two(p.days) : "--", "Days"],
    [p ? two(p.hours) : "--", "Hours"],
    [p ? two(p.minutes) : "--", "Minutes"],
    [p ? two(p.seconds) : "--", "Seconds"],
  ];
  const enrolment = !target || target.kind === "enrolment";
  const when = dateLabel(atMs);

  if (enrolment) {
    return board ? (
      <div
        className={cn("countdown-panel flex flex-col gap-5", className)}
        data-countdown
        data-target="enrolment"
      >
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-white/85">
            Founding enrolment
          </p>
          <p className="display text-[clamp(30px,3vw,42px)] !leading-[1.05] text-white">
            Opens {dayLabel(atMs)}
          </p>
        </div>
        <Tiles cells={cells} board />
        <p className="max-w-[42ch] text-[15px] leading-relaxed text-white/85">
          Join the waitlist and we&rsquo;ll message you on WhatsApp when it
          opens. Nothing to pay until then.
        </p>
        <p className="border-t border-white/15 pt-4 text-sm text-white/85">
          <span className="text-white">{when}</span>
          {cohortDay ? ` · ${cohortDay}` : ""}
        </p>
        <span className="sr-only" aria-live="polite">
          {spoken || `Founding enrolment opens ${when}.`}
        </span>
      </div>
    ) : (
      <div
        className={cn("flex flex-col gap-2", className)}
        data-countdown
        data-target="enrolment"
      >
        {withHeading ? (
          <p className="text-sm text-white/60">
            Founding enrolment opens {when}
          </p>
        ) : null}
        <Tiles cells={cells} board={false} />
        <p className="text-[13px] text-white/60">
          Enrolment opens {dayLabel(atMs)}. Nothing to pay until then.
        </p>
        <span className="sr-only" aria-live="polite">
          {spoken || `Founding enrolment opens ${when}.`}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col",
        board ? "countdown-panel gap-4" : "gap-2",
        className,
      )}
      data-countdown
      data-target={target.kind}
    >
      {board ? (
        <p className="flex items-baseline justify-between gap-3 text-sm font-medium text-white">
          <span>{target.label}</span>
          {target.name ? (
            <span className="text-white/85" data-cohort-name>
              {target.name}
            </span>
          ) : null}
        </p>
      ) : withHeading ? (
        <p className="text-sm text-white/60">
          {`${target.name ?? "Next cohort"} starts`} {when}
        </p>
      ) : null}
      <Tiles cells={cells} board={board} />
      {board ? (
        <p className="border-t border-white/15 pt-4 text-sm text-white/85">
          <span className="text-white">{when}</span>
          {phase === "enrol" ? (
            <>
              {" · enrolment open, "}
              <Price className="text-white" /> one-time
            </>
          ) : (
            ` · Enrolment opens ${dayLabel(enrolAtMs)}`
          )}
        </p>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {spoken || `Next cohort starts ${when}.`}
      </span>
    </div>
  );
}
