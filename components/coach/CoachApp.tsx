"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  allItems,
  coachNote,
  parseSaved,
  parts,
  progress,
  storageKey,
  timeline,
  type CoachCohort,
  type SavedCoach,
} from "@/lib/coach";
import { cn } from "@/lib/utils";

const fmtDay = (ms: number, withWeekday = false) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    weekday: withWeekday ? "long" : undefined,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(ms);
const two = (n: number) => String(n).padStart(2, "0");

/** localStorage, with an in-memory fallback when an embed's storage is blocked. */
function useCoachStore(cohortId: string) {
  const key = storageKey(cohortId);
  const [saved, setSaved] = useState<SavedCoach | null>(null);
  const [ready, setReady] = useState(false);
  const [persistent, setPersistent] = useState(true);

  useEffect(() => {
    try {
      setSaved(parseSaved(localStorage.getItem(key)));
    } catch {
      setPersistent(false);
    }
    setReady(true);
  }, [key]);

  const write = (next: SavedCoach | null) => {
    setSaved(next);
    try {
      if (next) localStorage.setItem(key, JSON.stringify(next));
      else localStorage.removeItem(key);
    } catch {
      setPersistent(false);
    }
  };
  return { saved, ready, persistent, write };
}

export default function CoachApp({ cohort }: { cohort: CoachCohort }) {
  const { saved, ready, persistent, write } = useCoachStore(cohort.id);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const start = () => write({ startedAt: Date.now(), done: saved?.done ?? [] });
  const restart = () => write(null);
  const toggle = (id: string, on: boolean) => {
    if (!saved) return;
    const done = new Set(saved.done);
    if (on) done.add(id);
    else done.delete(id);
    write({ ...saved, done: [...done] });
  };

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8 px-5 py-8 sm:px-8 sm:py-10">
      {ready && saved && now !== null ? (
        <Running
          cohort={cohort}
          saved={saved}
          now={now}
          onToggle={toggle}
          onRestart={restart}
        />
      ) : (
        <Intro cohort={cohort} onStart={start} disabled={!ready} />
      )}
      {!persistent ? (
        <p
          className="rounded-lg bg-tint px-4 py-3 text-[13px] text-ink-2"
          role="status"
        >
          This browser isn&rsquo;t letting the embed save progress, so it will
          reset when you close the page. Opening the coach in its own tab
          usually fixes this.
        </p>
      ) : null}
      <p className="text-[12px] leading-relaxed text-ink-3">
        Progress is saved in this browser only. Veerly helps you get organised
        and prepared; it doesn&rsquo;t guarantee a job.
      </p>
    </div>
  );
}

/* ───────────── Intro ───────────── */
function Intro({
  cohort,
  onStart,
  disabled,
}: {
  cohort: CoachCohort;
  onStart: () => void;
  disabled: boolean;
}) {
  const startsMs = new Date(cohort.startsAt).getTime();
  const total = allItems(cohort).length;
  return (
    <section
      aria-labelledby="coach-title"
      className="flex flex-col gap-8"
      data-coach="intro"
    >
      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium text-brand">Veerly cohort coach</p>
        <h1
          id="coach-title"
          className="display text-[clamp(36px,7vw,52px)] leading-[1.02]"
        >
          {cohort.name}
        </h1>
        <p className="tnum text-[17px] text-ink-2">
          Starts {fmtDay(startsMs, true)} · {cohort.weeks} weeks
        </p>
        <p className="max-w-[58ch] text-[16px] leading-relaxed text-ink-2">
          This is everything the cohort expects of you, in one place. It&rsquo;s
          one commitment for the whole cohort, not a list you unlock step by
          step. Work through it in whatever order suits you; the weekly focus is
          there to help.
        </p>
      </header>

      <Expectations cohort={cohort} />

      <div className="flex flex-col items-start gap-3 border-t border-line pt-6">
        <ConfirmStart
          cohort={cohort}
          total={total}
          onStart={onStart}
          disabled={disabled}
        />
        <p className="text-[13px] text-ink-3">
          You&rsquo;ll confirm before anything starts.
        </p>
      </div>
    </section>
  );
}

function Expectations({ cohort }: { cohort: CoachCohort }) {
  return (
    <div
      className="grid gap-x-8 gap-y-7 sm:grid-cols-2"
      aria-label="Cohort expectations"
    >
      {cohort.groups.map((g) => (
        <section
          key={g.id}
          aria-labelledby={`g-${g.id}`}
          className="flex flex-col gap-2"
        >
          <h2 id={`g-${g.id}`} className="text-[15px] font-semibold text-ink">
            {g.title}
          </h2>
          <ul className="flex flex-col border-t border-line">
            {g.items.map((i) => (
              <li
                key={i.id}
                className="flex gap-2.5 border-b border-line py-2.5 text-[14.5px] leading-snug text-ink-2"
              >
                <Check
                  className="mt-0.5 size-4 shrink-0 text-brand"
                  strokeWidth={2.25}
                  aria-hidden="true"
                />
                {i.text}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ConfirmStart({
  cohort,
  total,
  onStart,
  disabled,
}: {
  cohort: CoachCohort;
  total: number;
  onStart: () => void;
  disabled: boolean;
}) {
  const startsMs = new Date(cohort.startsAt).getTime();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="lg" disabled={disabled} data-coach-start>
          Start my cohort
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent data-coach-confirm>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to start?</AlertDialogTitle>
          <AlertDialogDescription>
            Starting begins one {cohort.weeks}-week window for {cohort.name},
            with all {total} expectations in view. Plan for a few focused hours
            each week, the weekly live session and a short Sunday review. It’s
            fine to start early; your weeks are counted from {fmtDay(startsMs)}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Not yet</AlertDialogCancel>
          <AlertDialogAction onClick={onStart}>
            Yes, start my cohort
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ───────────── Running (active / before day one / closed) ───────────── */
function Running({
  cohort,
  saved,
  now,
  onToggle,
  onRestart,
}: {
  cohort: CoachCohort;
  saved: SavedCoach;
  now: number;
  onToggle: (id: string, on: boolean) => void;
  onRestart: () => void;
}) {
  const t = timeline(cohort, saved.startedAt, now);
  const p = progress(cohort, saved.done);
  const note = coachNote(t, p);
  const done = useMemo(() => new Set(saved.done), [saved.done]);

  if (t.status === "closed") {
    const finished = allItems(cohort).filter((i) => done.has(i.id));
    const remaining = allItems(cohort).filter((i) => !done.has(i.id));
    return (
      <section
        aria-labelledby="coach-title"
        className="flex flex-col gap-8"
        data-coach="closed"
      >
        <header className="flex flex-col gap-3">
          <p className="text-sm font-medium text-brand">
            {cohort.name} · ended {fmtDay(t.endMs)}
          </p>
          <h1
            id="coach-title"
            className="display text-[clamp(30px,6vw,44px)] leading-[1.04]"
          >
            Your cohort window has closed.
          </h1>
          <p className="text-[17px] text-ink-2">
            Here&rsquo;s what you finished and how to keep going.
          </p>
        </header>
        <ProgressBlock p={p} />
        <p className="rounded-xl bg-tint px-5 py-4 text-[15px] leading-relaxed text-ink">
          {note.replace(/^Your cohort window has closed\.\s*/, "")}
        </p>
        <div className="grid gap-8 sm:grid-cols-2">
          <section aria-labelledby="finished" className="flex flex-col gap-2">
            <h2 id="finished" className="text-[15px] font-semibold">
              What you finished ({finished.length})
            </h2>
            {finished.length ? (
              <ul className="flex flex-col border-t border-line">
                {finished.map((i) => (
                  <li
                    key={i.id}
                    className="flex gap-2.5 border-b border-line py-2.5 text-[14.5px] text-ink-2"
                  >
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-proof"
                      strokeWidth={2.25}
                      aria-hidden="true"
                    />
                    {i.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[14.5px] text-ink-2">
                Nothing ticked yet, and that&rsquo;s okay. Your systems are
                still here.
              </p>
            )}
          </section>
          <section aria-labelledby="keep-going" className="flex flex-col gap-2">
            <h2 id="keep-going" className="text-[15px] font-semibold">
              How to keep going
            </h2>
            <ul className="flex flex-col gap-2 text-[14.5px] leading-relaxed text-ink-2">
              <li>
                Keep the Sunday review: twenty minutes, what moved and
                what&rsquo;s next.
              </li>
              <li>
                Your Notion systems are yours to keep, so carry on where you
                left off.
              </li>
              {remaining.length ? (
                <li>
                  Pick one open item to finish next:{" "}
                  <span className="text-ink">
                    {remaining[0].text.toLowerCase()}
                  </span>
                  .
                </li>
              ) : null}
            </ul>
          </section>
        </div>
        <Checklist
          cohort={cohort}
          done={done}
          onToggle={onToggle}
          title="Your full checklist"
        />
        <RestartLink cohort={cohort} onRestart={onRestart} />
      </section>
    );
  }

  const c = parts(t.remainingMs);
  const cells: [string, string][] = [
    [two(c.days), "Days"],
    [two(c.hours), "Hours"],
    [two(c.minutes), "Minutes"],
    [two(c.seconds), "Seconds"],
  ];
  return (
    <section
      aria-labelledby="coach-title"
      className="flex flex-col gap-7"
      data-coach={t.status}
    >
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-brand">Veerly cohort coach</p>
          <h1
            id="coach-title"
            className="display text-[clamp(30px,6vw,40px)] leading-[1.04]"
          >
            {cohort.name}
          </h1>
        </div>
        <p className="tnum text-[15px] text-ink-2">
          {t.status === "before"
            ? `Starts ${fmtDay(t.windowStartMs, true)}`
            : `Week ${t.week} of ${cohort.weeks}`}
        </p>
      </header>

      <div className="countdown-panel flex flex-col gap-4" data-coach-countdown>
        <p className="text-sm font-medium text-white">
          {t.status === "before"
            ? "Your cohort window ends in"
            : "Time left in your cohort"}
        </p>
        <div className="grid grid-cols-4 gap-2 sm:gap-3" aria-hidden="true">
          {cells.map(([v, unit]) => (
            <div key={unit} className="flex flex-col gap-2">
              <div className="flap flex aspect-[1/0.9] items-center justify-center overflow-hidden rounded-xl bg-yellow text-ink shadow-[0_1px_0_rgb(255_255_255/0.45)_inset,0_-2px_0_rgb(0_43_66/0.18)_inset,0_12px_24px_-12px_rgb(0_0_0/0.6)]">
                <span className="display tnum text-[clamp(32px,7vw,52px)] leading-none">
                  {v}
                </span>
              </div>
              <span className="text-center text-xs tracking-wide text-white/85">
                {unit}
              </span>
            </div>
          ))}
        </div>
        <p className="border-t border-white/15 pt-4 text-sm text-white/85">
          Ends <span className="text-white">{fmtDay(t.endMs, true)}</span>
          {t.status === "before" ? ` · begins ${fmtDay(t.windowStartMs)}` : ""}
        </p>
        <span className="sr-only" aria-live="polite">
          {`${c.days} days and ${c.hours} hours left in your cohort.`}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1.1fr_1fr]">
        <div
          className="flex flex-col gap-2 rounded-xl border border-line p-5"
          data-coach-focus
        >
          <p className="text-[13px] font-medium text-brand">
            {t.status === "before"
              ? "Before day one"
              : `This week · Week ${t.week}`}
          </p>
          <p className="text-[17px] font-semibold text-ink">{t.focus.title}</p>
          <p className="text-[14.5px] leading-relaxed text-ink-2">
            {t.focus.focus}
          </p>
        </div>
        <div
          className="flex flex-col gap-2 rounded-xl bg-tint p-5"
          data-coach-note
        >
          <p className="text-[13px] font-medium text-brand">Coach note</p>
          <p className="text-[14.5px] leading-relaxed text-ink">{note}</p>
        </div>
      </div>

      <ProgressBlock p={p} />
      <Checklist
        cohort={cohort}
        done={done}
        onToggle={onToggle}
        title="Your cohort expectations"
      />
      <RestartLink cohort={cohort} onRestart={onRestart} />
    </section>
  );
}

function ProgressBlock({ p }: { p: ReturnType<typeof progress> }) {
  return (
    <div className="flex flex-col gap-3" data-coach-progress>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[15px] font-semibold">Overall progress</p>
        <p className="tnum text-[15px] text-ink-2">
          <span className="font-semibold text-ink">{p.done}</span> of {p.total}{" "}
          · {p.percent}%
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="Overall progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={p.percent}
        className="h-2.5 overflow-hidden rounded-full bg-tint-line"
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${p.percent}%` }}
        />
      </div>
      <ul className="tnum grid grid-cols-2 gap-x-8 gap-y-1.5 text-[13px] text-ink-3">
        {p.groups.map((g) => (
          <li
            key={g.id}
            className="flex justify-between gap-2 border-b border-line pb-1.5"
          >
            <span>{g.title}</span>{" "}
            <span
              className={cn("text-ink-2", g.done === g.total && "text-proof")}
            >
              {g.done}/{g.total}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Checklist({
  cohort,
  done,
  onToggle,
  title,
}: {
  cohort: CoachCohort;
  done: Set<string>;
  onToggle: (id: string, on: boolean) => void;
  title: string;
}) {
  return (
    <section
      aria-labelledby="checklist-title"
      className="flex flex-col gap-4"
      data-coach-checklist
    >
      <div className="flex flex-col gap-1">
        <h2 id="checklist-title" className="text-[17px] font-semibold">
          {title}
        </h2>
        <p className="text-[13px] text-ink-3">Tick things off in any order.</p>
      </div>
      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {cohort.groups.map((g) => (
          <fieldset key={g.id} className="flex flex-col gap-1">
            <legend className="mb-1 text-[14px] font-semibold text-ink">
              {g.title}
            </legend>
            <ul className="flex flex-col border-t border-line">
              {g.items.map((i) => {
                const on = done.has(i.id);
                return (
                  <li key={i.id} className="border-b border-line">
                    <label
                      htmlFor={`x-${i.id}`}
                      className="flex cursor-pointer items-start gap-3 py-2.5 text-[14.5px] leading-snug"
                    >
                      <Checkbox
                        id={`x-${i.id}`}
                        checked={on}
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
          </fieldset>
        ))}
      </div>
    </section>
  );
}

function RestartLink({
  cohort,
  onRestart,
}: {
  cohort: CoachCohort;
  onRestart: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 self-start rounded text-[13px] font-medium text-ink-3 underline-offset-4 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          data-coach-restart
        >
          <RotateCcw className="size-3.5" aria-hidden="true" /> Restart
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restart {cohort.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This clears your start time and ticks in this browser and takes you
            back to the beginning. Your Notion systems aren&rsquo;t affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep my progress</AlertDialogCancel>
          <AlertDialogAction onClick={onRestart}>
            Yes, restart
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
