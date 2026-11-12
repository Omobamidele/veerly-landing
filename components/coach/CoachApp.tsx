"use client";

import { useEffect, useMemo, useState } from "react";
import { IconRestart } from "@/components/icons/veerly-icons";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  coachNote,
  ensureStarted,
  parseSaved,
  parts,
  progress,
  storageKey,
  timeline,
  type CoachCohort,
  type CoachTimeline,
  type SavedCoach,
} from "@/lib/coach";
import { cn } from "@/lib/utils";

/**
 * Compact cohort coach, sized for a Notion embed block (designed for ~640px tall at 700-1000px wide, no
 * internal scroll). The cohort clock starts automatically the first time the page is opened.
 */

const fmtDay = (ms: number, opts: { weekday?: boolean; year?: boolean } = {}) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    weekday: opts.weekday ? "short" : undefined,
    day: "numeric",
    month: "long",
    year: opts.year === false ? undefined : "numeric",
  }).format(ms);
const two = (n: number) => String(n).padStart(2, "0");
/** The window ends at 9:00 on the Monday after week 4, so the last working day is the day before. */
const lastDay = (t: CoachTimeline) => t.endMs - 12 * 3_600_000;

/** localStorage with an in-memory fallback; starts the clock on first open. */
function useCoachStore(cohortId: string) {
  const key = storageKey(cohortId);
  const [saved, setSaved] = useState<SavedCoach | null>(null);
  const [persistent, setPersistent] = useState(true);

  useEffect(() => {
    let existing: SavedCoach | null = null;
    let canStore = true;
    try {
      existing = parseSaved(localStorage.getItem(key));
    } catch {
      canStore = false;
    }
    const { state, isNew } = ensureStarted(existing, Date.now());
    if (isNew && canStore) {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch {
        canStore = false;
      }
    }
    setPersistent(canStore);
    setSaved(state);
  }, [key]);

  const write = (next: SavedCoach) => {
    setSaved(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      setPersistent(false);
    }
  };
  return { saved, persistent, write };
}

export default function CoachApp({ cohort }: { cohort: CoachCohort }) {
  const { saved, persistent, write } = useCoachStore(cohort.id);
  const [now, setNow] = useState<number | null>(null);
  const [tab, setTab] = useState(cohort.groups[0]?.id ?? "");

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const toggle = (id: string, on: boolean) => {
    if (!saved) return;
    const done = new Set(saved.done);
    if (on) done.add(id);
    else done.delete(id);
    write({ ...saved, done: [...done] });
  };
  const restart = () => write({ startedAt: Date.now(), done: [] });

  const ready = saved !== null && now !== null;
  const t = ready ? timeline(cohort, saved.startedAt, now) : null;
  const p = progress(cohort, saved?.done ?? []);

  return (
    <div
      className="coach-card mx-auto flex w-full max-w-[1040px] flex-col gap-4 px-1 py-2"
      data-coach={t?.status ?? "loading"}
    >
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-[13px] font-medium text-brand">
            Veerly cohort coach
          </p>
          <h1
            id="coach-title"
            className="display text-[28px] leading-[1.05] text-ink"
          >
            {cohort.name}
            <span className="ml-2 align-middle text-[15px] font-normal tracking-normal text-ink-3 [font-family:var(--font-sans)]">
              {cohort.weeks} weeks
            </span>
          </h1>
        </div>
        <div className="flex flex-col items-end gap-0.5 text-right">
          <p className="tnum text-[14px] font-medium text-ink" data-coach-phase>
            {!t
              ? "\u00a0"
              : t.status === "before"
                ? `Starts ${fmtDay(t.windowStartMs, { weekday: true })}`
                : t.status === "active"
                  ? `Week ${t.week} of ${cohort.weeks}`
                  : `Ended ${fmtDay(lastDay(t))}`}
          </p>
          <p className="tnum text-[13px] text-ink-3" data-coach-started>
            {saved
              ? `Your cohort clock started on ${fmtDay(saved.startedAt)}`
              : "\u00a0"}
          </p>
        </div>
      </header>

      <div className="grid gap-4 min-[640px]:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          {t?.status === "closed" ? (
            <ClosedPanel t={t} done={p.done} total={p.total} />
          ) : (
            <Countdown t={t} />
          )}
          <FocusCard
            cohort={cohort}
            t={t}
            note={
              t
                ? coachNote(t, p).replace(/^Your cohort window has closed\.\s*/, "")
                : ""
            }
          />
        </div>

        <Checklist
          cohort={cohort}
          saved={saved}
          p={p}
          tab={tab}
          onTab={setTab}
          onToggle={toggle}
        />
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line pt-3 text-[12px] leading-snug text-ink-3">
        <p>
          {persistent
            ? "Saved in this browser only."
            : "This browser isn\u2019t letting the embed save, so progress resets when you close the page."}{" "}
          Veerly helps you get organised and prepared; it doesn&rsquo;t
          guarantee a job.
        </p>
        <RestartLink cohort={cohort} onRestart={restart} disabled={!ready} />
      </footer>
    </div>
  );
}

/* ───────────── Countdown (yellow tiles on navy) ───────────── */
function Countdown({ t }: { t: CoachTimeline | null }) {
  const c = t ? parts(t.countdownMs) : null;
  const cells: [string, string][] = [
    [c ? two(c.days) : "––", "Days"],
    [c ? two(c.hours) : "––", "Hours"],
    [c ? two(c.minutes) : "––", "Minutes"],
    [c ? two(c.seconds) : "––", "Seconds"],
  ];
  const label = !t
    ? "\u00a0"
    : t.countdownTo === "start"
      ? "Day one in"
      : "Time left in your cohort";
  return (
    <div className="countdown-panel flex flex-col gap-3" data-coach-countdown>
      <p className="text-[13px] font-medium text-white">{label}</p>
      <div className="grid grid-cols-4 gap-2" aria-hidden="true">
        {cells.map(([v, unit]) => (
          <div key={unit} className="flex flex-col gap-1.5">
            <div className="countdown-tile grid h-[62px] place-items-center overflow-hidden rounded-[10px] bg-yellow text-ink">
              <span className="display tnum text-[34px] leading-none">{v}</span>
            </div>
            <span className="text-center text-[11px] tracking-wide text-white/80">
              {unit}
            </span>
          </div>
        ))}
      </div>
      <p className="tnum border-t border-white/15 pt-2.5 text-[13px] text-white/80">
        {t ? (
          t.countdownTo === "start" ? (
            <>
              Begins{" "}
              <span className="text-white">
                {fmtDay(t.windowStartMs, { weekday: true })}
              </span>{" "}
              at 9:00 WAT
            </>
          ) : (
            <>
              Last day{" "}
              <span className="text-white">
                {fmtDay(lastDay(t), { weekday: true })}
              </span>
            </>
          )
        ) : (
          "\u00a0"
        )}
      </p>
      {c ? (
        <span className="sr-only">
          {`${c.days} days and ${c.hours} hours ${t?.countdownTo === "start" ? "until day one" : "left in your cohort"}.`}
        </span>
      ) : null}
    </div>
  );
}

function ClosedPanel({
  t,
  done,
  total,
}: {
  t: CoachTimeline;
  done: number;
  total: number;
}) {
  return (
    <div className="countdown-panel flex flex-col gap-3" data-coach-closed>
      <p className="text-[13px] font-medium text-white">
        Your cohort window has closed
      </p>
      <p className="display tnum text-[44px] leading-none text-yellow">
        {done}
        <span className="ml-2 text-[18px] font-medium tracking-normal text-white/75 [font-family:var(--font-sans)]">
          of {total} done
        </span>
      </p>
      <p className="border-t border-white/15 pt-2.5 text-[13px] text-white/80">
        Ended{" "}
        <span className="text-white">
          {fmtDay(lastDay(t), { weekday: true })}
        </span>
        . Your Notion workspace is yours to keep.
      </p>
    </div>
  );
}

function FocusCard({
  cohort,
  t,
  note,
}: {
  cohort: CoachCohort;
  t: CoachTimeline | null;
  note: string;
}) {
  const heading = !t
    ? "\u00a0"
    : t.status === "before"
      ? "Getting ready"
      : t.status === "active"
        ? `This week · Week ${t.week}`
        : "After the cohort";
  const focus = t?.focus ?? cohort.setupFocus;
  return (
    <div
      className="flex flex-col rounded-xl border border-line bg-white"
      data-coach-focus
    >
      <div className="flex flex-col gap-1 px-4 pt-3 pb-3">
        <p className="text-[12.5px] font-medium text-brand">{heading}</p>
        <p className="text-[15px] font-semibold text-ink">{focus.title}</p>
        <p className="text-[13.5px] leading-relaxed text-ink-2">
          {focus.focus}
        </p>
      </div>
      <div
        className="flex flex-col gap-1 rounded-b-xl border-t border-line bg-tint px-4 py-3"
        data-coach-note
      >
        <p className="text-[12.5px] font-medium text-brand">Coach note</p>
        <p className="text-[13.5px] leading-relaxed text-ink">
          {note || "\u00a0"}
        </p>
      </div>
    </div>
  );
}

/* ───────────── Expectations: progress + group tabs + one group's checklist ───────────── */
function Checklist({
  cohort,
  saved,
  p,
  tab,
  onTab,
  onToggle,
}: {
  cohort: CoachCohort;
  saved: SavedCoach | null;
  p: ReturnType<typeof progress>;
  tab: string;
  onTab: (id: string) => void;
  onToggle: (id: string, on: boolean) => void;
}) {
  const done = useMemo(() => new Set(saved?.done ?? []), [saved?.done]);
  const group = cohort.groups.find((g) => g.id === tab) ?? cohort.groups[0];
  const idx = cohort.groups.indexOf(group);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = cohort.groups.length;
    const next =
      cohort.groups[(idx + (e.key === "ArrowRight" ? 1 : n - 1)) % n];
    onTab(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  return (
    <section
      aria-labelledby="checklist-title"
      className="flex min-w-0 flex-col rounded-xl border border-line bg-white"
      data-coach-checklist
    >
      <div className="flex flex-col gap-2 px-4 pt-3.5 pb-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2
            id="checklist-title"
            className="text-[15px] font-semibold text-ink"
          >
            Your cohort expectations
          </h2>
          <p className="tnum text-[13px] text-ink-2" data-coach-progress>
            <span className="font-semibold text-ink">{p.done}</span> of{" "}
            {p.total} · {p.percent}%
          </p>
        </div>
        <div
          role="progressbar"
          aria-label="Overall progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={p.percent}
          className="h-2 overflow-hidden rounded-full bg-tint-line"
        >
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${p.percent}%` }}
          />
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Expectation groups"
        className="grid grid-cols-4 border-y border-line"
        onKeyDown={onKey}
      >
        {cohort.groups.map((g) => {
          const gp = p.groups.find((x) => x.id === g.id)!;
          const on = g.id === group.id;
          const complete = gp.done === gp.total;
          return (
            <button
              key={g.id}
              id={`tab-${g.id}`}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={`panel-${g.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => onTab(g.id)}
              data-coach-tab={g.id}
              className={cn(
                "relative flex min-w-0 flex-col items-start gap-0.5 px-2.5 py-2 text-left transition-colors not-last:border-r not-last:border-line focus-visible:z-10 focus-visible:-outline-offset-2",
                on ? "bg-tint" : "bg-white hover:bg-ground",
              )}
            >
              <span
                className={cn(
                  "w-full truncate text-[12.5px] font-medium",
                  on ? "text-ink" : "text-ink-2",
                )}
              >
                {g.short}
              </span>
              <span
                className={cn(
                  "tnum text-[12px]",
                  complete ? "text-proof" : "text-ink-3",
                )}
              >
                {gp.done}/{gp.total}
              </span>
              {on ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-brand"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        id={`panel-${group.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${group.id}`}
        className="flex flex-col px-4 pt-2 pb-2"
      >
        <p className="pt-1 pb-1 text-[12.5px] text-ink-3">
          {group.title} · tick things off in any order
        </p>
        <ul className="flex flex-col">
          {group.items.map((i) => {
            const on = done.has(i.id);
            return (
              <li key={i.id} className="border-b border-line last:border-b-0">
                <label
                  htmlFor={`x-${i.id}`}
                  className="flex cursor-pointer items-start gap-3 py-2.5 text-[14px] leading-snug"
                >
                  <Checkbox
                    id={`x-${i.id}`}
                    checked={on}
                    disabled={!saved}
                    onCheckedChange={(v) => onToggle(i.id, v === true)}
                    className="mt-0.5"
                  />
                  <span
                    className={cn(
                      on
                        ? "text-ink-3 line-through decoration-ink-3/50"
                        : "text-ink-2",
                    )}
                  >
                    {i.text}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function RestartLink({
  cohort,
  onRestart,
  disabled,
}: {
  cohort: CoachCohort;
  onRestart: () => void;
  disabled: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded text-[12px] font-medium text-ink-3 underline-offset-4 hover:text-ink hover:underline disabled:opacity-50"
          data-coach-restart
        >
          <IconRestart className="size-3" aria-hidden="true" /> Restart
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restart {cohort.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This clears your ticks in this browser and starts your cohort clock
            again from today. Your Notion workspace isn&rsquo;t affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep my progress</AlertDialogCancel>
          <AlertDialogAction onClick={onRestart}>Yes, restart</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
