import type { Metadata } from "next";
import { Footer, Nav } from "@/components/SiteChrome";
import { CONSENT_VERSION, consentText } from "@/lib/consent";

export const metadata: Metadata = { title: "Privacy notice (draft)" };

export default function Privacy() {
  return (
    <>
      <Nav />
      <main className="page" id="main">
        <article className="wrap prose">
          <h1>Privacy notice</h1>
          <p className="draft-note">Draft — to be reviewed before launch. This is a working draft, not legal advice.</p>

          <h2>What we collect</h2>
          <ul>
            <li>On the waitlist: your name, email address and, if you choose, your WhatsApp number.</li>
            <li>If you personalize your plan: country, current profession or career interest, career stage, preferred remote career path and, optionally, your LinkedIn profile link.</li>
            <li>If you pay: a payment reference, amount, currency and status from our payment provider. We never see or store your card details.</li>
            <li>Your consent choices, the time you made them and the wording you agreed to (version {CONSENT_VERSION}). We don&rsquo;t store your IP address with your signup.</li>
          </ul>

          <h2>Why we use it</h2>
          <ul>
            <li>To tell you when founding enrolment opens, in the ways you chose.</li>
            <li>To personalize your career plan and the Veerly workspace you receive.</li>
            <li>To deliver what you paid for and support you during the cohort.</li>
          </ul>

          <h2>Your consent</h2>
          <p>We ask separately for each channel, and both boxes start unticked:</p>
          <ul>
            <li>Email: &ldquo;{consentText.email}&rdquo;</li>
            <li>WhatsApp: &ldquo;{consentText.whatsapp}&rdquo;</li>
          </ul>

          <h2>How to opt out</h2>
          <ul>
            <li>Email: use the unsubscribe link in any email.</li>
            <li>WhatsApp: reply STOP to any message.</li>
            <li>To ask for a copy of your data or for it to be deleted, contact us at [contact email to be added].</li>
          </ul>

          <h2>Who processes your data</h2>
          <ul>
            <li>Email: Brevo (email marketing and transactional email).</li>
            <li>WhatsApp: Meta&rsquo;s WhatsApp Business Platform, directly or through Brevo.</li>
            <li>Payments: Paystack.</li>
            <li>Hosting and storage: [hosting provider and database to be confirmed].</li>
          </ul>
          <p>We don&rsquo;t sell your personal data.</p>

          <h2>Contact</h2>
          <p>[Business name, contact email and address to be added before launch.]</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
