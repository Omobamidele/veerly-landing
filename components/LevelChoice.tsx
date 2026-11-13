"use client";

import Link from "next/link";
import { IconArrowRight, IconCheck } from "@/components/icons/veerly-icons";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  LEVEL_LABEL,
  PATH_META,
  levelCardsFor,
  type CareerPath,
  type LevelId,
} from "@/lib/levels";
import { cn } from "@/lib/utils";
import { LevelChangeFee, Price } from "./Currency";
import LevelQuiz from "./LevelQuiz";
import { useLevel } from "./LevelProvider";


function chooseAndJoin(
  setPlan: (path: CareerPath, level: LevelId) => void,
  path: CareerPath,
  level: LevelId,
) {
  setPlan(path, level);
  requestAnimationFrame(() => {
    document
      .getElementById("join-card")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

export default function LevelChoice({
  cohortWindow,
}: {
  /** e.g. "1–28 February 2027" */
  cohortWindow: string;
}) {
  const { path, pathLabel, level, setPath, setPlan } = useLevel();
  const cards = path ? levelCardsFor(path) : null;

  return (
    <section
      id="levels"
      aria-labelledby="levels-title"
      className="scroll-mt-24 bg-navy py-24 text-white sm:py-32"
    >
      <div className="wrap flex flex-col gap-12 sm:gap-14">
        <div className="grid gap-8 lg:grid-cols-12">
          <h2 id="levels-title" className="h2 text-white lg:col-span-7">
            Choose your path and level.{" "}
            <span className="text-yellow">Each one gets its own workspace.</span>
          </h2>
          <div className="flex max-w-[44ch] flex-col gap-3 text-lg leading-relaxed text-white/80 lg:col-span-4 lg:col-start-9 lg:pt-2">
            <p>
              Every career path has Beginner, Intermediate and Advanced. Pick
              both, and you only receive the workspace for that combination.
            </p>
            <p className="text-[15px] text-white/70">
              Cohort 1 runs {cohortWindow}. Same one-time price for every path
              and level: <Price className="font-medium text-yellow" />.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <label
              htmlFor="career-path"
              className="text-sm font-medium text-white"
            >
              Your career path
            </label>
            <NativeSelect
              id="career-path"
              value={path ?? ""}
              onChange={(e) => {
                const next = e.target.value as CareerPath;
                if (next) setPath(next);
              }}
              className="h-12 w-full border-transparent bg-white text-ink shadow-none sm:hidden"
            >
              <NativeSelectOption value="">Choose a path</NativeSelectOption>
              {PATH_META.map((p) => (
                <NativeSelectOption key={p.id} value={p.id}>
                  {p.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <ul className="hidden grid-cols-2 gap-2 sm:grid lg:grid-cols-5">
            {PATH_META.map((p) => {
              const selected = path === p.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPath(p.id)}
                    className={cn(
                      "flex h-full min-h-16 w-full min-w-0 items-center rounded-xl px-3.5 py-3 text-left text-[14px] leading-snug font-semibold tracking-[-0.01em] text-pretty transition-colors",
                      selected
                        ? "bg-yellow text-ink"
                        : "bg-white/8 text-white hover:bg-white/14",
                    )}
                  >
                    {p.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div
          className="flex flex-col gap-6 border-y border-white/15 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:py-8"
          data-level-check
        >
          <div className="flex min-w-0 flex-col gap-2.5">
            <p className="flex items-center gap-2.5 text-[13px] font-medium text-yellow">
              <span
                aria-hidden="true"
                className="h-3 w-5 shrink-0 bg-yellow [clip-path:polygon(0_0,100%_0,100%_100%,29%_100%)]"
              />
              Level check, about a minute
            </p>
            <p className="font-display text-[24px] leading-tight font-extrabold tracking-[-0.025em] text-balance text-white sm:text-[28px]">
              Not sure which level fits you?
            </p>
            <p className="max-w-[52ch] text-[15px] leading-relaxed text-white/75">
              Five short questions in plain words. We suggest one, and you
              choose.
            </p>
          </div>
          <LevelQuiz
            trigger={
              <Button
                type="button"
                size="lg"
                variant="stage"
                className="shrink-0 sm:max-w-[22rem]"
              >
                Not sure? Take the 1-minute level check
                <IconArrowRight data-icon="inline-end" />
              </Button>
            }
          />
        </div>

        {cards ? (
          <ul
            id="level-cards"
            className="grid scroll-mt-24 items-stretch gap-4 lg:grid-cols-3 lg:gap-5"
          >
            {cards.map((card) => {
              const selected = level === card.id;
              return (
                <li
                  key={card.id}
                  className={cn(
                    "flex flex-col gap-6 rounded-2xl p-6 sm:p-8",
                    selected ? "bg-yellow text-ink" : "bg-white text-ink",
                  )}
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="font-display text-[28px] leading-none font-extrabold tracking-[-0.025em]">
                      {card.name}
                    </h3>
                    <p className="text-[15px] leading-relaxed text-ink-2">
                      For {pathLabel}. {card.who}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-[13px] font-medium text-ink-3">
                      You&rsquo;ll learn
                    </p>
                    <ul className="flex flex-col">
                      {card.learn.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 border-b border-ink/10 py-2.5 text-[15px] leading-snug last:border-b-0"
                        >
                          <IconCheck
                            className="icon-first-line size-4 shrink-0 text-navy"
                            strokeWidth={2.5}
                            aria-hidden="true"
                          />
                          <span className="min-w-0">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-[13px] font-medium text-ink-3">
                      You&rsquo;ll be able to
                    </p>
                    <ul className="flex flex-col">
                      {card.able.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 border-b border-ink/10 py-2.5 text-[15px] leading-snug last:border-b-0"
                        >
                          <IconCheck
                            className="icon-first-line size-4 shrink-0 text-navy"
                            strokeWidth={2.5}
                            aria-hidden="true"
                          />
                          <span className="min-w-0">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-2">
                    <Button
                      type="button"
                      size="lg"
                      variant={selected ? "default" : "yellow"}
                      className="w-full"
                      aria-pressed={selected}
                      disabled={!path}
                      onClick={() =>
                        path && chooseAndJoin(setPlan, path, card.id)
                      }
                    >
                      {selected ? (
                        <>
                          <IconCheck data-icon="inline-start" />
                          {LEVEL_LABEL[card.id]} selected
                        </>
                      ) : (
                        card.cta
                      )}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-2xl bg-white/8 px-6 py-10 text-center text-[15px] text-white/80">
            Choose a career path above to see Beginner, Intermediate and
            Advanced.
          </p>
        )}

        <div className="-mt-4 flex max-w-[68ch] flex-col gap-2 text-[15px] leading-relaxed text-white/80">
          <p data-level-switch>
            Be sure before you choose. Picking a level now is free. Each extra
            level you want after you pay is an additional fee of{" "}
            <LevelChangeFee className="font-medium text-yellow" />.{" "}
            <Link
              href="/add-level"
              className="rounded-sm font-medium text-yellow underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-yellow/60"
            >
              Chose the wrong level?
            </Link>
          </p>
          <p className="text-[13px] text-white/60">
            These describe skills you can show at the end of the cohort. They
            are not a job guarantee.
          </p>
        </div>
      </div>
    </section>
  );
}
