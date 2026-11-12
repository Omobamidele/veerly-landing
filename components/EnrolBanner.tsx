"use client";

import { useLaunch } from "./LaunchProvider";

/**
 * Full-width yellow bar, in the same role as Lemon Squeezy's announcement band.
 * It says ONE thing the hero doesn't: when the founding cohort runs. The enrolment date,
 * waitlist copy and "Join the waitlist" action live once each, in the hero panel and the nav,
 * so the top of the page never repeats itself. Always a single line, at every width.
 */
export default function EnrolBanner({
  cohortWindow,
}: {
  /** e.g. "1–28 February 2027" */
  cohortWindow: string;
}) {
  const { launched } = useLaunch();
  return (
    <div className="bg-yellow text-ink">
      <div className="wrap flex h-10 items-center justify-center">
        {launched ? (
          <a
            href="#levels"
            className="truncate text-[13px] font-semibold tracking-[-0.005em] no-underline underline-offset-4 hover:underline sm:text-[14px]"
          >
            Founding enrolment is open: choose your path and level
          </a>
        ) : (
          <p className="truncate text-[13px] font-semibold tracking-[-0.005em] sm:text-[14px]">
            Founding cohort
            <span aria-hidden="true" className="px-2 text-ink/40">
              ·
            </span>
            <span className="font-medium">
              <span className="hidden sm:inline">Cohort 1 runs </span>
              {cohortWindow}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
