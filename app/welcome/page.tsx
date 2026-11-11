import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, Check, Clock } from "lucide-react";
import { Footer, Nav } from "@/components/SiteChrome";
import { paymentsEnabled, site } from "@/lib/config";
import { cohortOne, formatWhen } from "@/lib/launch";
import { LEVEL_LABEL, parseLevel, VA_PATH_LABEL, type VaLevel } from "@/lib/levels";
import { processSuccessfulCharge } from "@/lib/payments";
import { parseMetadata, verifyTransaction } from "@/lib/paystack";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false, follow: false },
};

type State = "paid" | "pending" | "failed" | "none";
type Resolved = { state: State; level: VaLevel | null };

async function resolveState(
  reference?: string,
  preview?: string,
  previewLevel?: string,
): Promise<Resolved> {
  if (preview === "paid")
    return { state: "paid", level: parseLevel(previewLevel) };
  if (!reference || !paymentsEnabled()) return { state: "none", level: null };
  try {
    const tx = await verifyTransaction(reference); // never trust the redirect alone
    const level = parseLevel(parseMetadata(tx.metadata).level);
    if (tx.status === "success") {
      const r = await processSuccessfulCharge(tx); // idempotent with the webhook
      return { state: r.ok ? "paid" : "failed", level };
    }
    return {
      state:
        tx.status === "abandoned" ||
        tx.status === "ongoing" ||
        tx.status === "pending"
          ? "pending"
          : "failed",
      level,
    };
  } catch (err) {
    console.error("[welcome] verify failed", err);
    return { state: "pending", level: null };
  }
}

export default async function Welcome({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const { state, level } = await resolveState(
    sp.reference || sp.trxref,
    sp.preview,
    sp.level,
  );
  const levelName = level ? LEVEL_LABEL[level] : null;
  const c1 = cohortOne();
  const cohortStart = formatWhen(new Date(c1.startsAt));
  const c1Window = "1–28 February 2027";

  return (
    <>
      <Nav />
      <main className="page" id="main">
        <div className="wrap welcome">
          {state === "paid" ? (
            <>
              <p className="status-pill ok">
                <Check size={14} strokeWidth={2.5} aria-hidden="true" /> Payment
                confirmed
              </p>
              <h1>Welcome to Veerly.</h1>
              <p className="lede">
                You&rsquo;re in the founding cohort
                {levelName
                  ? `, on the ${VA_PATH_LABEL} ${levelName} plan. You'll get the ${levelName} workspace only. Cohort 1 runs ${c1Window}`
                  : ""}
                . Here&rsquo;s what happens next.
                {process.env.BREVO_PAID_TEMPLATE_ID
                  ? " We've also emailed these steps to you."
                  : ""}
              </p>
              <ol className="next-steps">
                <li>
                  <span className="num">1</span>
                  <div>
                    <h3>Complete your career assessment</h3>
                    <p>
                      About ten minutes. Your answers shape your personalized
                      plan.
                    </p>
                    {site.assessmentUrl ? (
                      <a className="btn btn-primary" href={site.assessmentUrl}>
                        Start the assessment
                      </a>
                    ) : (
                      <p className="muted">
                        Your assessment link will arrive by email.
                      </p>
                    )}
                  </div>
                </li>
                <li>
                  <span className="num">2</span>
                  <div>
                    <h3>Get your three Notion systems</h3>
                    <p>
                      Create a free Notion account with the same email you paid
                      with. We&rsquo;ll share Job Hunt OS, Portfolio Builder and
                      the Interview Preparation System with you, personalized to
                      your plan
                      {levelName
                        ? `, in your ${VA_PATH_LABEL} ${levelName} workspace`
                        : ""}
                      .
                    </p>
                    {site.notionAccessUrl ? (
                      <a
                        className="btn btn-secondary"
                        href={site.notionAccessUrl}
                      >
                        Open access instructions
                      </a>
                    ) : null}
                  </div>
                </li>
                <li>
                  <span className="num">3</span>
                  <div>
                    <h3>
                      {c1.name} starts {cohortStart}
                    </h3>
                    <p>
                      We&rsquo;ll send the weekly schedule by email and WhatsApp
                      before the start.
                    </p>
                    {c1.startsAt ? (
                      <a
                        className="btn btn-secondary"
                        href="/api/calendar/cohort.ics"
                      >
                        <CalendarPlus size={16} aria-hidden="true" /> Add to
                        calendar
                      </a>
                    ) : null}
                  </div>
                </li>
              </ol>
            </>
          ) : state === "pending" ? (
            <>
              <p className="status-pill">
                <Clock size={14} aria-hidden="true" /> Confirming payment
              </p>
              <h1>We&rsquo;re confirming your payment.</h1>
              <p className="lede">
                This usually takes a few seconds. Refresh this page, or check
                your email for confirmation.
              </p>
            </>
          ) : state === "failed" ? (
            <>
              <h1>Your payment didn&rsquo;t go through.</h1>
              <p className="lede">
                No money was taken for this attempt. You can{" "}
                <Link href="/#join">try again</Link>.
              </p>
            </>
          ) : (
            <>
              <h1>Welcome to Veerly.</h1>
              <p className="lede">
                This page confirms founding-cohort payments. If you&rsquo;ve
                just paid, open the link from your Paystack receipt, or{" "}
                <Link href="/#join">return to the homepage</Link>.
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
