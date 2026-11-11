"use client";

import { useLaunch } from "./LaunchProvider";

/**
 * Full-width yellow bar, in the same role as Lemon Squeezy's announcement band:
 * one confident line, navy-on-yellow, always visible at the top of the homepage
 * until enrolment opens. The hero countdown keeps Mo's exact v8.1 wording.
 */
export default function EnrolBanner() {
  const { launched, label } = useLaunch();
  if (launched) {
    return (
      <div className="bg-yellow text-ink">
        <div className="wrap flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2.5">
          <p className="text-[14px] font-semibold tracking-[-0.01em]">
            Founding enrolment is open.
          </p>
          <a
            href="#levels"
            className="text-[14px] font-bold underline-offset-4 hover:underline"
          >
            Choose your path and enrol
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-yellow text-ink">
      <div className="wrap flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2.5">
        <p className="text-[14px] font-semibold tracking-[-0.01em]">
          Founding enrolment opens {label}.
        </p>
        <a
          href="#levels"
          className="text-[14px] font-bold underline-offset-4 hover:underline"
        >
          Join the waitlist
        </a>
      </div>
    </div>
  );
}
