import type { Metadata } from "next";
import { Footer, Nav } from "@/components/SiteChrome";
import { cohortOne, enrolAt, formatWhen } from "@/lib/launch";

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
            career plan, the Veerly Job Hunt OS, Portfolio Builder and Interview
            Preparation System, and cohort activities and resources. One-time
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

          <h2>Payments and refunds</h2>
          <p>
            Payments are processed by Paystack. Our refund policy will be
            published before enrolment opens.
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
