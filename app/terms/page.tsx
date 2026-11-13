import type { Metadata } from "next";
import { Footer, Nav } from "@/components/SiteChrome";
import { cohortOne, enrolAt, formatWhen } from "@/lib/launch";
import { USD_RATES_UPDATED, formatLevelChange } from "@/lib/pricing";

export const metadata: Metadata = { title: "Terms (draft)" };

export default function Terms() {
  return (
    <>
      <Nav />
      <main className="page" id="main">
        <article className="wrap prose">
          <h1>Terms</h1>
          <p className="draft-note">
            Draft — to be reviewed before launch. This is a working draft, not
            legal advice.
          </p>

          <h2>What you&rsquo;re buying</h2>
          <p>
            The Veerly Remote Career Accelerator founding cohort: a personalized
            career plan, one Notion workspace for the career path and level you
            choose (with the Veerly Job Hunt OS, Portfolio Builder and Interview
            Preparation System inside it), and cohort activities and resources. One-time
            payment of ₦10,000 (or $7.99 where US-dollar checkout is available;
            other currencies on the site are shown for reference only and your
            bank converts the charge) per cohort. No subscription.
          </p>

          <h2>No employment guarantee</h2>
          <p>
            Veerly helps you get organised, build proof of your skills and
            prepare for applications and interviews. We do not guarantee a job,
            interviews or any specific outcome.
          </p>

          <h2>Your access</h2>
          <p>
            You keep the Notion resources you purchased after the cohort ends.
            Community and live support follow the cohort policy, which will be
            published before enrolment opens.
          </p>

          <h2>Personal licence</h2>
          <p className="draft-note">
            Draft for Mo to approve, like the refund section below.
          </p>
          <p>
            Each purchase is a personal, single-user licence. It covers your
            own copy of the Veerly workspace for the career path and level you
            chose. You may duplicate it into your own Notion and edit it for
            your own learning.
          </p>
          <p>
            You may not share, resell, republish or give copies of the
            workspace, or the link to the original, to anyone else. If you do,
            your access to Veerly ends (the coach, videos, feedback, community
            and future refreshes) and we will not refund you. Veerly keeps all
            rights to the content.
          </p>

          <h2>Payments and refunds</h2>
          <p>
            Payments are processed by Paystack.
          </p>
          <h3>Refunds</h3>
          <p className="draft-note">
            Draft for Mo to approve. This section is a working draft, not
            legal advice, and is not linked from the navigation or the FAQ
            until it is approved.
          </p>
          <p>
            You can ask for a full refund up to 7 days before your cohort
            starts, as long as you have not opened or duplicated the
            workspace. After that, or once you have accessed the workspace, we
            do not offer a refund, except where the law requires it.
          </p>
          <p>
            To request a refund, email us using the contact details below, from
            the same email address you paid with, and include your payment
            reference. We will confirm the request and, if it qualifies, refund
            the amount you paid to the original payment method. Banks can take
            a few working days to show the money.
          </p>
          <p>
            If Veerly has to cancel a cohort, or cannot deliver the workspace
            you paid for, you will be offered a full refund or a place on a
            later cohort.
          </p>

          <h3>Level changes and extra levels</h3>
          <p className="draft-note">
            Draft for Mo to approve, like the refund section above.
          </p>
          <p>
            Each career path and level has its own workspace, and you choose
            one when you enrol. Choosing or changing your level on the website
            before you pay is free.
          </p>
          <p>
            After you have paid, each extra level you want is a separate
            additional fee (an add-on): {formatLevelChange("USD")} for each
            level, or {formatLevelChange("NGN")} if you pay in naira. Outside
            Nigeria the website also shows an approximate amount in your own
            currency so you can convert; it is for reference only (see{" "}
            {formatLevelChange("GBP")} for an example, using rates last updated{" "}
            {USD_RATES_UPDATED}) and the fee itself stays the same. You keep
            the level you already paid for. The fee is separate from the
            founding price and is not refundable, except where the law
            requires it.
          </p>
          <p>
            You buy an extra level on the &ldquo;Get another level&rdquo; page.
            You can only buy a level you do not already have. After your
            payment is confirmed, we send you the Notion link for that level by
            WhatsApp or email. This is checked by hand against our payment
            records, so it may take a little time. Each level you add is a
            personal licence for you only, with the same rules as your first
            level.
          </p>

          <h2>Changes</h2>
          <p>
            Founding enrolment and payment open {formatWhen(enrolAt())}.{" "}
            {cohortOne().name} starts{" "}
            {formatWhen(new Date(cohortOne().startsAt))}. Later cohort dates are
            planned and may change. We&rsquo;ll tell everyone affected by email
            and, where you opted in, WhatsApp.
          </p>

          <h2>Contact</h2>
          <p>[Business name and contact details to be added before launch.]</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
