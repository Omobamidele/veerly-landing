import type { Metadata } from "next";
import CoachApp from "@/components/coach/CoachApp";
import { coachCohort } from "@/lib/coach";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Cohort coach",
  robots: { index: false, follow: false },
};

/** Cohort coach, built to be embedded in Notion (/embed). Framing is allowed for this route only (next.config.mjs). */
export default async function CoachPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const cohort = coachCohort(typeof sp.cohort === "string" ? sp.cohort : null);
  return (
    <main id="main" className="coach min-h-svh bg-white text-ink">
      <CoachApp cohort={cohort} />
    </main>
  );
}
