"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import {
  IconArrowRight,
  IconBoard,
  IconCalendarClock,
  IconCalendarDays,
  IconDashboard,
  IconLibrary,
  IconPath,
  IconPortfolio,
  type VeerlyIconProps,
} from "@/components/icons/veerly-icons";
import { cn } from "@/lib/utils";

/**
 * "See inside your workspace": real screenshots of the live Veerly Notion
 * pages (11 Nov 2026), after the branded covers, custom icons and emoji
 * removal. Cropped only: Notion's breadcrumb bar, Edited/Share chrome, side
 * margins and two hover drag handles were removed; page content is untouched.
 * Files: public/notion/<name>-<width>.{avif,webp}.
 */

type Shot = {
  id: string;
  tab: string;
  blurb: string;
  /** Honest label for where this screen comes from. */
  label: string;
  /** Page title as it appears in Notion. */
  page: string;
  Icon: React.ComponentType<VeerlyIconProps>;
  file: string;
  widths: number[];
  width: number;
  height: number;
  alt: string;
};

const BEGINNER = "Virtual Assistant · Beginner workspace";

const shots: Shot[] = [
  {
    id: "home",
    tab: "Home",
    blurb: "Your plan, dates and links on one page",
    label: BEGINNER,
    page: "Veerly VA — Beginner",
    Icon: IconDashboard,
    file: "va-beginner-home",
    widths: [800, 1200, 1791],
    width: 1791,
    height: 971,
    alt: "Notion home page titled Veerly VA — Beginner, with a navy and yellow Veerly cover labelled VA · Beginner, a blue V page icon, a summary card (1 to 28 February 2027, 4 weeks, live sessions 9:00 AM Lagos time, 3 portfolio projects with scorecards) and link cards to Learning Path, Portfolio Projects, Job-ready checklist, Your trackers and Veerly VA Library.",
  },
  {
    id: "clock",
    tab: "Cohort clock",
    blurb: "One countdown to day one of your cohort",
    label: BEGINNER,
    page: "Veerly VA — Beginner",
    Icon: IconCalendarClock,
    file: "va-beginner-cohort-clock",
    widths: [800, 1097],
    width: 1097,
    height: 456,
    alt: "Cohort clock on the Beginner home: Ready to start your cohort? Four yellow tiles count down the days, hours, minutes and seconds to Monday 1 February, 9:00 WAT, above a Start my cohort clock button and the note that Veerly doesn't guarantee a job.",
  },
  {
    id: "weeks",
    tab: "Four-week plan",
    blurb: "What you learn and do, week by week",
    label: BEGINNER,
    page: "Veerly VA — Beginner",
    Icon: IconCalendarDays,
    file: "va-beginner-four-weeks",
    widths: [800, 1200, 1791],
    width: 1791,
    height: 1024,
    alt: "Your 4 weeks at a glance: four cards for Week 1 (inbox), Week 2 (calendars, time zones and clear messages), Week 3 (research, documents and spreadsheets) and Week 4 (getting ready for your first client), each with You'll learn bullets and Do this week checkboxes.",
  },
  {
    id: "project",
    tab: "Portfolio project",
    blurb: "A guided brief you finish as a portfolio piece",
    label: BEGINNER,
    page: "Inbox-zero system for a busy founder",
    Icon: IconPortfolio,
    file: "va-beginner-project-inbox-zero",
    widths: [800, 1190],
    width: 1190,
    height: 629,
    alt: "Portfolio project page titled Inbox-zero system for a busy founder, with a navy Veerly cover labelled Project · Beginner, an inbox page icon and a note that the cohort clock hasn't started yet.",
  },
  {
    id: "trackers",
    tab: "Trackers",
    blurb: "Applications, weekly reviews and practice, in your own copy",
    label: BEGINNER,
    page: "Veerly VA Trackers — Beginner",
    Icon: IconBoard,
    file: "va-beginner-trackers",
    widths: [800, 1190],
    width: 1190,
    height: 941,
    alt: "Veerly VA Trackers — Beginner page with a yellow Veerly cover labelled Tracker · Beginner, a card explaining what the trackers hold, and three steps for duplicating the page into your own Notion workspace.",
  },
  {
    id: "library",
    tab: "VA Library",
    blurb: "Study pages, starter SOPs and interview prep",
    label: "Virtual Assistant · VA Library",
    page: "Veerly VA Library",
    Icon: IconLibrary,
    file: "va-library",
    widths: [800, 1190],
    width: 1190,
    height: 834,
    alt: "Veerly VA Library page with a blue Veerly cover, and link cards to Resources (31 study pages), SOP Library (7 starter SOPs), Interview Prep (questions and your intro) and Keyword Bank (every term, A to Z).",
  },
];

const SIZES = "(min-width: 1264px) 820px, (min-width: 1024px) 66vw, calc(100vw - 40px)";

function srcSet(shot: Shot, ext: "avif" | "webp") {
  return shot.widths
    .map((w) => `/notion/${shot.file}-${w}.${ext} ${w}w`)
    .join(", ");
}

function Screenshot({ shot }: { shot: Shot }) {
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(shot, "avif")} sizes={SIZES} />
      <source type="image/webp" srcSet={srcSet(shot, "webp")} sizes={SIZES} />
      <img
        src={`/notion/${shot.file}-${shot.widths[0]}.webp`}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full"
      />
    </picture>
  );
}

export default function Workspace() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();

  function onKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const last = shots.length - 1;
    const next =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? i === last ? 0 : i + 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? i === 0 ? last : i - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <section
      id="workspace"
      aria-labelledby="workspace-title"
      className="scroll-mt-24 bg-navy py-24 text-white sm:py-32"
    >
      <div className="wrap flex flex-col gap-12 sm:gap-14">
        <div className="grid gap-8 lg:grid-cols-12">
          <h2 id="workspace-title" className="h2 text-white lg:col-span-7">
            See inside your workspace.{" "}
            <span className="text-yellow">Real pages, straight from Notion.</span>
          </h2>
          <div className="flex max-w-[44ch] flex-col gap-3 text-lg leading-relaxed text-white/80 lg:col-span-4 lg:col-start-9 lg:pt-2">
            <p>
              These screens are from the Virtual Assistant Beginner workspace
              and the VA Library, captured from the live pages on 11 November
              2026.
            </p>
            <p className="text-[15px] text-white/70">
              Each path and level has its own workspace, with its own plan,
              projects and library, so yours won&rsquo;t match these screen
              for screen.
            </p>
          </div>
        </div>

        <div data-row className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Tabs: a scrolling row on mobile, a stacked list on desktop. */}
          <div
            role="tablist"
            aria-label="Workspace pages"
            className="-mx-5 flex snap-x scroll-px-5 gap-2 overflow-x-auto px-5 pb-1 lg:col-span-4 lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-0 lg:pb-0"
          >
            {shots.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`${base}-tab-${s.id}`}
                  aria-selected={on}
                  aria-controls={`${base}-panel-${s.id}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={cn(
                    "group flex shrink-0 snap-start items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow lg:px-4 lg:py-3.5",
                    on
                      ? "bg-yellow text-ink"
                      : "text-white/85 hover:bg-white/[0.07] hover:text-white",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-lg",
                      on ? "bg-navy text-white" : "bg-white/10 text-white",
                    )}
                    style={
                      on
                        ? ({ "--veerly-icon-accent": "#FFD84D" } as React.CSSProperties)
                        : undefined
                    }
                  >
                    <s.Icon className="size-5" accent={on} strokeWidth={1.9} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[15px] font-semibold whitespace-nowrap">
                      {s.tab}
                    </span>
                    <span
                      className={cn(
                        "hidden text-[13px] leading-snug lg:block",
                        on ? "text-ink/75" : "text-white/60",
                      )}
                    >
                      {s.blurb}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8">
            {shots.map((s, i) => (
              <div
                key={s.id}
                role="tabpanel"
                id={`${base}-panel-${s.id}`}
                aria-labelledby={`${base}-tab-${s.id}`}
                hidden={i !== active}
                tabIndex={0}
                className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow rounded-2xl"
              >
                <figure className="overflow-hidden rounded-2xl bg-white text-ink shadow-[0_24px_60px_-24px_rgb(0_0_0/0.55)] ring-1 ring-white/10">
                  {/* App window bar (our frame, not part of the screenshot). */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-tint-line bg-tint px-4 py-3 sm:px-5">
                    <span className="flex gap-1.5" aria-hidden="true">
                      <span className="size-2.5 rounded-full bg-navy/25" />
                      <span className="size-2.5 rounded-full bg-navy/25" />
                      <span className="size-2.5 rounded-full bg-yellow" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink">
                      {s.page}
                    </span>
                    <span className="basis-full rounded-md bg-yellow px-2 py-1 text-[12px] font-semibold text-ink sm:basis-auto">
                      {s.label}
                    </span>
                  </div>
                  <Screenshot shot={s} />
                  <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-line bg-ground px-4 py-3 text-[14px] text-ink-2 sm:px-5">
                    <span>
                      <span className="font-medium text-ink">{s.tab}.</span>{" "}
                      {s.blurb}.
                    </span>
                    <a
                      href={`/notion/${s.file}-${s.width}.webp`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1 font-medium whitespace-nowrap text-brand underline-offset-4 hover:underline"
                    >
                      View full size
                      <span className="sr-only"> ({s.page}, opens in a new tab)</span>
                      <IconArrowRight className="size-3.5" aria-hidden="true" />
                    </a>
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>

        <p className="flex items-start gap-2.5 text-[14px] text-white/70">
          <IconPath
            className="mt-0.5 size-4 shrink-0 text-yellow"
            accent={false}
            aria-hidden="true"
          />
          <span>
            Each path and level has its own workspace. Screenshots are cropped
            from the live Notion pages; the page content isn&rsquo;t edited.
          </span>
        </p>
      </div>
    </section>
  );
}
