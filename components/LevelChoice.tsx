"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEVEL_CARDS, LEVEL_LABEL, type VaLevel } from "@/lib/levels";
import { cn } from "@/lib/utils";
import { Price } from "./Currency";
import { useLevel } from "./LevelProvider";

function chooseAndJoin(setLevel: (level: VaLevel) => void, id: VaLevel) {
  setLevel(id);
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
  const { level, setLevel } = useLevel();

  return (
    <section
      id="levels"
      aria-labelledby="levels-title"
      className="scroll-mt-24 border-t border-line py-24 sm:py-32"
    >
      <div className="wrap flex flex-col gap-12 sm:gap-14">
        <div className="grid gap-8 lg:grid-cols-12">
          <h2 id="levels-title" className="h2 lg:col-span-7">
            Choose your Virtual Assistant level.{" "}
            <span className="quiet">Each level gets its own workspace.</span>
          </h2>
          <div className="flex flex-col gap-3 max-w-[44ch] text-lg leading-relaxed text-ink-2 lg:col-span-4 lg:col-start-9 lg:pt-2">
            <p>
              Pick Beginner, Intermediate or Advanced. You only receive the
              workspace for the level you choose.
            </p>
            <p className="text-[15px] text-ink-3">
              Cohort 1 runs {cohortWindow}. Same one-time price for every
              level: <Price className="font-medium text-ink-2" />.
            </p>
          </div>
        </div>

        <ul className="grid items-stretch gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-3">
          {LEVEL_CARDS.map((card) => {
            const selected = level === card.id;
            return (
              <li
                key={card.id}
                className={cn(
                  "flex flex-col gap-6 bg-white p-6 sm:p-8",
                  selected && "bg-tint",
                )}
              >
                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-[28px] leading-none font-bold tracking-[-0.025em] text-ink">
                    {card.name}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-ink-2">
                    {card.who}
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
                        className="flex items-start gap-2.5 border-b border-line py-2.5 text-[15px] leading-snug text-ink last:border-b-0"
                      >
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-brand"
                          strokeWidth={2.25}
                          aria-hidden="true"
                        />
                        {item}
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
                        className="flex items-start gap-2.5 border-b border-line py-2.5 text-[15px] leading-snug text-ink last:border-b-0"
                      >
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-brand"
                          strokeWidth={2.25}
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-2">
                  <Button
                    type="button"
                    size="lg"
                    variant={selected ? "default" : "outline"}
                    className="w-full"
                    aria-pressed={selected}
                    onClick={() => chooseAndJoin(setLevel, card.id)}
                  >
                    {selected ? (
                      <>
                        <Check data-icon="inline-start" />
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

        <p className="-mt-6 text-[13px] text-ink-3">
          These describe skills you can show at the end of the cohort. They are
          not a job guarantee.
        </p>
      </div>
    </section>
  );
}
