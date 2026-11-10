# Veerly — Remote Career Accelerator (landing page and launch system)

Next.js 15 (App Router) + TypeScript. A calm, single-page site with a launch countdown, a two-step waitlist
(email and WhatsApp opt-in), Paystack checkout, a post-payment welcome page, Brevo email sync, a WhatsApp
launch-notification script, and a small admin view. **Nothing is sent or charged until you add your own keys.**

**Design (v5):** "Blue stage, yellow signal" (Lemon Squeezy true blue #0075AD, navy countdown panel, no product imagery) — see `DESIGN.md` for the spec, references and tokens. Built with Tailwind CSS v4,
shadcn/ui (Radix) components in `components/ui/`, and restrained GSAP + ScrollTrigger motion (`components/Motion.tsx`, off for
`prefers-reduced-motion`). Fonts: Bricolage Grotesque (display) and Geist (body). Previous designs: git tags `v1`, `v2`
(v1 also in `_v1-archive/`).

## Run it

```bash
npm install
npm run dev                        # http://localhost:3210
npm run build && npm run start     # production mode on :3210
```

Preview states:

- `/?preview=launched` shows the page after the countdown ends (checkout), and `/?preview=prelaunch` forces the waitlist.
- `/welcome?preview=paid` shows the post-payment onboarding page.
- You can force either state site-wide with `NEXT_PUBLIC_LAUNCH_STATE=launched|prelaunch`.

Checks: `npm run lint` · `npm run typecheck` · `npm test` (13 tests: Paystack signatures, webhook idempotency,
consent rules, phone normalisation, Brevo sync with mocked fetch, checkout states, ICS) · `npm run screenshots`.

## How the launch works

- **Countdown:** counts down to `NEXT_PUBLIC_LAUNCH_AT` (default `2026-12-01T09:00:00+01:00`, shown as "1 December 2026, 9:00 AM WAT").
  It renders on the client to avoid hydration mismatches, keeps a fixed width so the layout doesn't shift, and only
  announces to screen readers once a minute.
- **At zero,** the page switches by itself: the hero card becomes "Get founding access", the pricing button goes to checkout,
  and the waitlist copy changes. `/api/checkout` also checks the launch time on the server.
- **Waitlist step 1:** name, email and WhatsApp number (country picker defaults to Nigeria +234, all countries supported, stored as E.164).
  There are two separate, unticked consent boxes:
  - email updates and marketing;
  - WhatsApp launch notification.

  People must tick at least one, and the WhatsApp number is required only if they tick WhatsApp. Each consent is stored with a
  timestamp, the exact wording and a version (`lib/consent.ts`). IP addresses are never stored.
- **Waitlist step 2 (optional, skippable):** country, profession or interest, stage, path and LinkedIn. It updates the same record
  using a one-time edit token. If someone signs up again with an email that's already on the list, the record only gains
  information: no downgrades and no overwriting someone else's details.
- **Success:** a confirmation message, an `.ics` calendar invite for the launch (`/api/calendar/launch.ics`) and an optional WhatsApp channel link.
- **Spam protection:** a honeypot field and a per-IP rate limit (in memory, nothing is stored).

## Where data goes

`lib/store` holds the **primary store**, the single source of truth. The primary store always saves first, so data is never dropped:

| Store | When | Notes |
|---|---|---|
| `file` | Default locally | `data/waitlist.json` (gitignored), atomic writes |
| `upstash` | `WAITLIST_STORE=upstash` or `UPSTASH_REDIS_REST_URL` set | Use this on Vercel (read-only filesystem). Free tier available |

`lib/sinks` **mirrors** each change into other tools. Failures are logged and never block a signup:

| Sink | Enabled by | What it does |
|---|---|---|
| Brevo | `BREVO_API_KEY` | Adds or updates a contact, but only for people who consented. Adds email-consented people to `BREVO_LIST_ID` and WhatsApp-consented people to `BREVO_WHATSAPP_LIST_ID`, with attributes FIRSTNAME, LASTNAME, WHATSAPP, COUNTRY, CAREER_PATH, CAREER_STAGE, EMAIL_CONSENT, WHATSAPP_CONSENT, CONSENT_VERSION and PAID. Optional double opt-in (`BREVO_DOI_*`) or welcome template. Buyers go to `BREVO_PAID_LIST_ID` and receive `BREVO_PAID_TEMPLATE_ID` |
| Notion | `NOTION_TOKEN` + `NOTION_WAITLIST_DATABASE_ID` | One row per person, updated in place (properties listed in `lib/sinks/notion.ts`) |
| Webhook | `WAITLIST_WEBHOOK_URL` | POSTs `{event, signup}`. Use it for Google Sheets (Apps Script), Zapier, Make or n8n. Signed with `WAITLIST_WEBHOOK_SECRET` |

To add another tool, add a file in `lib/sinks/` that implements `Sink`. The UI doesn't change.

Create these custom contact attributes in Brevo first (Contacts → Settings → Attributes): CAREER_PATH, CAREER_STAGE, COUNTRY
(text), EMAIL_CONSENT, WHATSAPP_CONSENT, PAID (boolean), CONSENT_VERSION (text). FIRSTNAME, LASTNAME and WHATSAPP already exist.

## Email: why Brevo

Brevo is the primary email platform because:

- **The free plan is generous:** 300 emails a day, up to 100,000 stored contacts, transactional email, and automations for up to 2,000 contacts.
- **It does WhatsApp campaigns too,** from the same contact list. That suits Nigerian founders: no card is needed for the free plan,
  and WhatsApp runs on prepaid credits.

Its limits: free emails carry a "Sent with Brevo" badge, and campaigns to more than 300 people need requeuing day by day.
Upgrade to Starter before launch week if the list grows past 300.

Copy for every email is in `marketing/emails/` (welcome, 7 days to go, 1 day to go, doors open, 24h reminder, last call,
payment confirmed). Load them as Brevo templates or campaigns.

## WhatsApp launch notifications

Only opted-in numbers are messaged. Marketing messages outside a 24-hour chat window must use a **Meta-approved template**.

**Option A: Brevo WhatsApp (simplest).**
1. Link a WhatsApp Business Account to Brevo. You need a phone number not used on any WhatsApp app, plus your legal business name, address and a website on your own domain.
2. Get the business verified by Meta (up to 30 days; unverified accounts can only send a few messages a day and may be deactivated after 30 days).
3. Submit the templates in `marketing/whatsapp-templates.md`.
4. Buy WhatsApp credits.
5. Send a campaign to `BREVO_WHATSAPP_LIST_ID`. The WHATSAPP attribute is filled in for you.

**Option B: WhatsApp Cloud API directly.**
1. Create a Meta business portfolio and WhatsApp Business Account, then get a permanent token and phone number ID.
2. Get the same templates approved.
3. Run:
   ```bash
   npm run notify:launch                          # dry run: prints who would get it, sends nothing
   npm run notify:launch -- --send --limit 250    # real send (needs WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID)
   npm run notify:launch -- --send --template reminder
   ```
   It refuses to send without both `--send` and the env vars. It skips people already notified, sends in batches with retries,
   and logs to `data/notify-log.jsonl`.

**Cost and limits (Meta rate card effective 1 Oct 2026):** a marketing message to a Nigerian (+234) number costs **$0.0516**
per delivered message; utility messages cost $0.0067. New business portfolios can message **250 unique people per rolling 24 hours**.
That rises to 2,000 after verification or a scaling path, then 10,000 and 100,000 automatically with good quality.

## Payments: Paystack

1. In the hero card (launched state), the buyer enters name and email. `POST /api/checkout` initialises a Paystack transaction with
   NGN 10,000 by default (`PAYSTACK_AMOUNT_NGN`), metadata (signup id, career path) and `callback_url = <site>/welcome`, then redirects
   to Paystack's hosted checkout.
2. `/welcome?reference=…` **verifies the transaction on the server** (never trusting the redirect alone), marks the buyer paid, and
   shows next steps: assessment link, Notion access, cohort calendar.
3. `POST /api/paystack/webhook` verifies the signature on the raw body. It supports both the new timestamped `Paystack-Signature`
   (`PAYSTACK_WEBHOOK_SECRET`, `whsec_…`, 5-minute tolerance) and the legacy `x-paystack-signature` (HMAC-SHA512 with the secret key).
   It only accepts the exact founding price, and it's idempotent per reference. It then tags the buyer in Brevo and sends the onboarding email.
4. With no `PAYSTACK_SECRET_KEY`, the buttons show a clean "Payments open at launch" message instead of a broken checkout.

Set up in Paystack:
- Activate the business and add your test keys first.
- Set the webhook URL to `<site>/api/paystack/webhook` and the callback URL to `<site>/welcome`.
- Generate a webhook signing secret.

Fees (Paystack Nigeria): 1.5% + ₦100 on local cards, with the ₦100 waived under ₦2,500 and fees capped at ₦2,000. USD
(`PAYSTACK_ENABLE_USD=true`) needs a registered business approved for international payments and a Zenith USD domiciliary
account; international cards cost 3.9%. The code is open to adding Stripe or Lemon Squeezy later (`lib/paystack.ts` and `lib/payments.ts`).

## Admin

Set `ADMIN_PASSWORD`, then open `/admin/waitlist` (basic auth, any username). It shows counts and a table and has an
**Export CSV** button. Without the password the route returns 404. There's also a command-line export: `npm run export:csv`.

## Deploy later (Vercel)

1. Import the repo.
2. Set `NEXT_PUBLIC_SITE_URL`, `WAITLIST_STORE=upstash` with the Upstash keys, and Brevo and Paystack keys as needed.
3. Point Paystack's webhook at the deployed URL.

## Before launch

- [ ] Domain. `veerly.com` belongs to an unrelated company, so pick another and set `NEXT_PUBLIC_SITE_URL`.
- [ ] Contact email (`NEXT_PUBLIC_CONTACT_EMAIL`) and business details on /privacy and /terms.
- [ ] Review the /privacy and /terms drafts, and publish the refund and cohort policies.
- [ ] Paystack live keys, the Brevo lists and templates, and the WhatsApp templates approved.
- [ ] `NEXT_PUBLIC_ASSESSMENT_URL`, `NEXT_PUBLIC_NOTION_ACCESS_URL` and `NEXT_PUBLIC_COHORT_START_AT` once known.
