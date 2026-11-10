"use client";

import { useEffect, useState } from "react";
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

/** Screen readers hear an update once a minute, not every second. */
function useSpoken() {
  const { launchAtMs, now, launched } = useLaunch();
  const p = now === null ? null : parts(launchAtMs - now);
  const minuteKey = p ? `${p.days}-${p.hours}-${p.minutes}` : "";
  const [spoken, setSpoken] = useState("");
  useEffect(() => {
    if (!p) return;
    setSpoken(
      launched
        ? "Founding enrolment is open."
        : `Launching in ${p.days} days, ${p.hours} hours and ${p.minutes} minutes.`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minuteKey, launched]);
  return spoken;
}

/**
 * The signature moment: Mo's yellow countdown.
 * variant "board" = the hero board on the brand stage; "strip" = the compact version in the pricing band.
 */
export default function Countdown({
  variant = "board",
  className,
  note,
}: {
  variant?: "board" | "strip";
  className?: string;
  note?: string;
}) {
  const { launchAtMs, now, launched, label } = useLaunch();
  const spoken = useSpoken();
  const p = now === null ? null : parts(launchAtMs - now);
  const board = variant === "board";

  if (launched) {
    return (
      <div
        className={cn(
          "flex flex-col gap-3",
          board && "countdown-panel",
          className,
        )}
        data-countdown
      >
        <div
          data-tile
          className={cn(
            "flex items-end justify-between gap-4 rounded-xl bg-yellow text-ink shadow-[0_1px_0_rgb(255_255_255/0.45)_inset,0_-2px_0_rgb(0_43_66/0.18)_inset,0_12px_24px_-12px_rgb(0_0_0/0.6)]",
            board ? "px-6 py-6 sm:px-7 sm:py-7" : "px-5 py-4",
          )}
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink/70">
              Founding cohort
            </span>
            <span
              className={cn(
                "display !leading-[1.02]",
                board ? "text-[clamp(28px,2.6vw,38px)]" : "text-2xl",
              )}
            >
              Enrolment is open
            </span>
          </div>
          <span className="display tnum text-xl leading-none">$7.99</span>
        </div>
        {board ? (
          <p className="text-sm text-white/85">
            Opened {label}. One-time payment, about ₦10,000.
          </p>
        ) : null}
        <span className="sr-only" aria-live="polite">
          {spoken}
        </span>
      </div>
    );
  }

  const cells: [string, string][] = [
    [p ? two(p.days) : "--", "Days"],
    [p ? two(p.hours) : "--", "Hours"],
    [p ? two(p.minutes) : "--", "Minutes"],
    [p ? two(p.seconds) : "--", "Seconds"],
  ];

  return (
    <div
      className={cn(
        "flex flex-col",
        board ? "countdown-panel gap-4" : "gap-2",
        className,
      )}
      data-countdown
    >
      {board ? (
        <p className="text-sm font-medium text-white">
          Founding enrolment opens in
        </p>
      ) : null}
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
      {board ? (
        <p className="border-t border-white/15 pt-4 text-sm text-white/85">
          <span className="text-white">{label}</span>
          {note ? ` · ${note}` : ""}
        </p>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {spoken || `Launching ${label}.`}
      </span>
    </div>
  );
}
