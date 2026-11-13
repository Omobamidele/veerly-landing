# Veerly — Remote Career Accelerator (landing page and launch system)

Next.js 15 (App Router) + TypeScript. A calm, single-page site with a launch countdown, a two-step waitlist
(email and WhatsApp opt-in), Paystack checkout, a post-payment welcome page, Brevo email sync, a WhatsApp
launch-notification script, and a small admin view. **Nothing is sent or charged until you add your own keys.**

**Design (v5–v9):** "Blue stage, yellow signal" (Lemon Squeezy true blue #0075AD, navy countdown panel). v7 adds real screenshots of the Virtual Assistant Career OS. v8 adds a Virtual Assistant level picker (Beginner, Intermediate, Advanced) before waitlist or checkout. v8.1 puts the yellow countdown tiles on the hero from today, counting to enrolment on 1 January 2027. v9 gives every career path its own Beginner, Intermediate and Advanced plan, a bolder wordmark and yellow, and a currency detector that works on Netlify and Vercel — see `DESIGN.md` for the spec, references and tokens. Built with Tailwind CSS v4,
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

- Previews: `/?preview=prelaunch` and `/?preview=promo` show the founding-enrolment panel with yellow tiles counting to 1 January 2027 (waitlist only). `/?preview=enrol` (from 1 Jan: checkout open; `/?preview=launched` is the same) counts to the next cohort.
- `/welcome?preview=paid` shows the post-payment onboarding page. Add `&level=beginner` (or `intermediate` / `advanced`) to preview the plan on that page.
- You can force a phase site-wide with `NEXT_PUBLIC_LAUNCH_STATE=prelaunch|promo|enrol`.

Checks: `npm run lint` · `npm run typecheck` · `npm test` (Paystack signatures, webhook idempotency,
consent rules, VA levels, phone normalisation, Brevo sync with mocked fetch, checkout states, ICS) · `npm run screenshots`.

## How the launch works

- **Timeline (`lib/launch.ts`, all 9:00 AM WAT):**
  - Before 1 Dec 2026 and through 31 Dec: yellow countdown tiles count to founding enrolment on 1 January 2027, 9:00 AM WAT. Waitlist only.
  - 1 Dec 2026 (`NEXT_PUBLIC_LAUNCH_AT`): promotion starts. The countdown still aims at enrolment. It's still waitlist only.
  - 1 Jan 2027 (`NEXT_PUBLIC_ENROL_AT`): enrolment and Paystack checkout open. The countdown switches to the next cohort. Before this, `/api/checkout` refuses with `enrolment_not_open`.
  - 1 Feb 2027: Cohort 1 starts (confirmed; `NEXT_PUBLIC_COHORT_START_AT` overrides it). Cohort 2 (1 Mar 2027) and Cohort 3 (5 Apr 2027) are placeholders, followed by the first-Monday fallback.
  It renders on the client to avoid hydration mismatches, keeps a fixed width so the layout doesn't shift, and only
  announces to screen readers once a minute.
- **At zero,** the page switches by itself: the hero card becomes "Get founding access", the pricing button goes to checkout,
  and the waitlist copy changes. `/api/checkout` also checks the launch time on the server.
- **Path and level:** before joining the waitlist or paying, visitors choose a career path and a level (Beginner, Intermediate or Advanced). Every path has all three levels. Each combination has its own workspace; they only receive the one they choose. The price is the same at every path and level. The choice is saved on the signup, passed in Paystack metadata, and shown in the checkout summary and on the welcome page.
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
| Brevo | `BREVO_API_KEY` | Adds or updates a contact, but only for people who consented. Adds email-consented people to `BREVO_LIST_ID` and WhatsApp-consented people to `BREVO_WHATSAPP_LIST_ID`, with attributes FIRSTNAME, LASTNAME, WHATSAPP, COUNTRY, CAREER_PATH, CAREER_STAGE, LEVEL, EMAIL_CONSENT, WHATSAPP_CONSENT, CONSENT_VERSION and PAID. Optional double opt-in (`BREVO_DOI_*`) or welcome template. Buyers go to `BREVO_PAID_LIST_ID` and receive `BREVO_PAID_TEMPLATE_ID` |
| Notion | `NOTION_TOKEN` + `NOTION_WAITLIST_DATABASE_ID` | One row per person, updated in place (properties listed in `lib/sinks/notion.ts`) |
| Webhook | `WAITLIST_WEBHOOK_URL` | POSTs `{event, signup}`. Use it for Google Sheets (Apps Script), Zapier, Make or n8n. Signed with `WAITLIST_WEBHOOK_SECRET` |

To add another tool, add a file in `lib/sinks/` that implements `Sink`. The UI doesn't change.

Create these custom contact attributes in Brevo first (Contacts → Settings → Attributes): CAREER_PATH, CAREER_STAGE, LEVEL, COUNTRY
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

## Prices, currencies and the countdown

- **Prices:** edit `lib/pricing.ts`. It holds one hand-set table for NGN, USD, GBP, EUR, CAD, GHS, KES, ZAR, INR and AUD. There is no live FX. Nigeria is ₦10,000 by default; other countries are $7.99 unless we have a local display price. The default is detected from CDN geo headers (`lib/geo.ts`: Vercel, Netlify, Cloudflare and others), then Africa/Lagos (and other known zones), then a language-tag region. Visitors can pick a currency, and the choice is remembered in their browser. `/api/geo` repeats the header lookup for the client when the server did not receive a country.
- **Checkout currency:** NGN when NGN is picked. Any other currency charges USD only if `PAYSTACK_ENABLE_USD=true`, otherwise NGN. The site shows a short note whenever the shown currency isn't the charged one.
- **Dates:** edit `lib/launch.ts`, the one timeline config. The countdown logic is in `lib/cohorts.ts`. Until enrolment opens on 1 January 2027 the yellow tiles count down to that date. From then on they count to the next cohort. If the list runs out, they count to the first Monday of next month at 9:00 WAT, so they never stop.

## Payments: Paystack

1. In the hero card (launched state), the buyer enters name and email. `POST /api/checkout` initialises a Paystack transaction with
   the price from `lib/pricing.ts` (₦10,000 when the visitor picked NGN; otherwise $7.99 if `PAYSTACK_ENABLE_USD=true`, else ₦10,000), metadata (signup id, career path) and `callback_url = <site>/welcome`, then redirects
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

## Deploy later (Vercel or Netlify)

1. Import the repo.
2. Set `NEXT_PUBLIC_SITE_URL`, `WAITLIST_STORE=upstash` with the Upstash keys, and Brevo and Paystack keys as needed.
3. Point Paystack's webhook at the deployed URL.

## Before launch

- [ ] Domain. `veerly.com` belongs to an unrelated company, so pick another and set `NEXT_PUBLIC_SITE_URL`.
- [ ] Contact email (`NEXT_PUBLIC_CONTACT_EMAIL`) and business details on /privacy and /terms.
- [ ] Review the /privacy and /terms drafts, and publish the refund and cohort policies.
- [ ] Paystack live keys, the Brevo lists and templates, and the WhatsApp templates approved.
- [ ] `NEXT_PUBLIC_ASSESSMENT_URL`, `NEXT_PUBLIC_NOTION_ACCESS_URL` once known.

## v6.3 — Cohort coach (`/coach`, embeddable in Notion)

- **Route:** `/coach` (defaults to Cohort 1) or `/coach?cohort=cohort-2`. `noindex`, no site nav, designed for a ~700px Notion embed and responsive below that.
- **Flow:** intro card with all cohort expectations grouped by system → "Are you sure you want to start?" confirm → one countdown to the cohort end (yellow tiles on navy), overall progress, "this week" focus, coach note and a free-form checklist → a gentle "Your cohort window has closed" state. Reopening resumes; "Restart" has its own confirm.
- **Config:** `lib/coach.ts` (cohorts come from `lib/launch.ts`; per-cohort `weeks`, `groups`/expectations, `weeklyFocus`, `setupFocus`, `alignToCohortStart`). Logic tests in `tests/coach.test.ts`.
- **State:** `localStorage` key `veerly.coach.<cohortId>` (`{startedAt, done[]}`), per browser/device. If an embed's storage is blocked (some browsers partition or block third-party iframe storage), it falls back to memory and says so.
- **Framing:** `next.config.mjs` sends `Content-Security-Policy: frame-ancestors 'self' https://*.notion.so https://*.notion.site https://app.notion.com https://notion.so` for `/coach` only; every other route sends `frame-ancestors 'self'` + `X-Frame-Options: SAMEORIGIN`.
- **Embedding in Notion:** once the site is on a public HTTPS URL, type `/embed` in a Notion page and paste `https://<your-domain>/coach` (or `?cohort=cohort-2`). Notion cannot embed `localhost`.
- **Screenshots:** `python3 scripts/screenshots-coach.py` (prod on :3210) → `screenshots/v6.3-coach-{intro,confirm,active,closed}.png`.

## v7 — Inside your Veerly workspace

v9.3: a "See inside your workspace" section (`components/Workspace.tsx`, right after the three systems) shows real, cropped screenshots of the live Veerly Notion pages (VA Beginner home, cohort clock, four-week plan, a portfolio project, trackers, VA Library) in a tabbed app-window frame. Assets live in `public/notion/` as AVIF + WebP at 800/1200/full width. Each path and level has its own workspace; the section says so. Screenshots: `python3 scripts/screenshots-v93.py http://localhost:3210` writes `screenshots/v9.3-workspace-desktop.png` and `-mobile.png`.

v9.5: a "Which level am I?" check. Five plain-language questions (`lib/quiz.ts`, shown in `components/LevelQuiz.tsx` as an accessible shadcn dialog, bottom sheet on phones) suggest Beginner, Intermediate or Advanced. Wording follows the selected career path and falls back to generic wording. Scoring: 0 to 2 points per answer; 0-3 Beginner, 4-7 Intermediate, 8-10 Advanced; never done the work means Beginner; Advanced also needs experience, paid work and the hardest task. "Choose this level" selects it through `LevelProvider` (same state as the level cards) and records `levelSource: "quiz"` (otherwise `"manual"`) on the signup. It is stored in `profile.levelSource`, shown in the admin table and the `level_source` CSV column. Set `NEXT_PUBLIC_WHATSAPP_CHAT_URL` (for example `https://wa.me/234...`) to link "Message us on WhatsApp" for level switches. Checks: `python3 scripts/screenshots-v95-quiz.py <tag>` (overflow, 360-1920px, 125% scale) and `scripts/screenshots-v95-shots.py`.

v9.5.1: the level-check banner is now type-led (no icon tile; a small yellow notch from the logo marks the eyebrow), and a `levels` icon joined the custom set (`brand-src/icons-src/icons.py`). Changing level after choosing or paying is a paid add-on (see v9.6 below for how it works now).

## v9.6: "Get another level" (level add-on purchase)

Choosing or changing a level before payment is free. After checkout, each extra level is an **additional fee**, bought one level at a time.

- **Price** (`lib/pricing.ts`): `LEVEL_CHANGE_PRICES = { USD: 3.99, NGN: 5000 }`. Naira visitors see a fixed **₦5,000** (never "about"). Everyone else sees **$3.99** with an approximate local amount beside it, e.g. `$3.99 (about £2.98)`, worked out from the single hand-set table `USD_RATES` (last updated 13 Nov 2026; edit `perUsd` by hand, nothing is fetched live).
- **Charge**: naira visitors pay NGN 5,000. Others pay US$3.99 when `PAYSTACK_ENABLE_USD=true`; until then everyone pays the static NGN 5,000.
- **Page**: `/add-level`. Deep link: `/add-level?path=<slug>&level=<beginner|intermediate|advanced>` (slugs: sales, marketing, customer-success, operations, va, project-management, data, software, gtm, design). A link to a level the student already owns preselects nothing and says why.
- **Who owns what**: `Signup.owned` (set when the first payment succeeds and with each paid add-on) and `Signup.addons` (orders, same store). The page looks the student up by email or WhatsApp (`/api/addon/lookup`, paid students only, rate-limited). If no paid record is found the student states the level they have and the order is saved with `verified: false` so it is checked by hand before any Notion link is sent.
- **Checkout**: `/api/addon/checkout` (product `level_addon`, metadata: email, path, ownedLevel, addonLevel). Paystack returns to `/add-level/success`. The webhook and that page share `processSuccessfulCharge`, which handles add-ons idempotently.
- **CSV / admin**: columns `type, path, ownedLevel, addonLevel, amount, currency` (plus `addon_status`, `addon_reference`, `addon_owned_verified`, `addon_paid_at`); one extra row per add-on order. The admin page lists extra levels and flags unverified ones.
- **Links**: footer, FAQ "Can I change my level later?", the line under the levels, the welcome page, and the level-check result (shown when the suggested level is one the student does not own yet; this browser remembers paid levels in `localStorage` key `veerly.owned`).
