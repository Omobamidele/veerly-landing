# Veerly launch emails

Timeline (all 9:00 AM WAT, source of truth: `lib/launch.ts`): promotion starts **1 Dec 2026** (the site shows the countdown to Cohort 1, still waitlist only) → enrolment and payment open **1 Jan 2027** → **Cohort 1 starts 1 Feb 2027**.

Ready-to-paste copy for Brevo (Campaigns → Email, or Automations). Variables use Brevo syntax: `{{ contact.FIRSTNAME }}`.
Replace every `[placeholder]` before sending. The unsubscribe link must stay in every marketing email: Brevo's `{{ unsubscribe }}` tag inserts it.

| # | File | When | Audience |
|---|------|------|----------|
| 1 | 01-welcome.md | Right after signup (automation or BREVO_WELCOME_TEMPLATE_ID) | Email consent = true |
| 2 | 02-seven-days.md | 25 Dec 2026, 9:00 AM WAT | Email consent = true |
| 3 | 03-one-day.md | 31 Dec 2026, 9:00 AM WAT | Email consent = true |
| 4 | 04-doors-open.md | 1 Jan 2027, 9:00 AM WAT (enrolment + payment open) | Email consent = true |
| 5 | 05-24h-reminder.md | 2 Jan 2027, 9:00 AM WAT | Email consent = true AND PAID = false |
| 6 | 06-last-call.md | Final day of founding enrolment, before Cohort 1 starts on 1 Feb 2027 [exact date to confirm] | Email consent = true AND PAID = false |
| — | 07-payment-confirmed.md | After payment (BREVO_PAID_TEMPLATE_ID, transactional) | Buyers |

Brevo free plan: 300 emails per day. With more than 300 consented contacts, a campaign reaches 300 on the day and you'd
requeue the rest, so upgrade to Starter before launch week if the list is bigger.
