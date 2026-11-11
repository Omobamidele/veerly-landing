# Veerly — Remote Career Accelerator landing page

Marketing site and waitlist for the Veerly Remote Career Accelerator founding cohort.
Next.js 15 (App Router) + TypeScript, no UI framework, no secrets needed to preview.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3210 (hot reload)
# or production mode
npm run build && npm run start   # http://localhost:3210
```

## Waitlist: where submissions go

`POST /api/waitlist` (see `app/api/waitlist/route.ts` and `lib/waitlist.ts`)
validates on both client and server (name and email are required, LinkedIn must be a linkedin.com link),
has a hidden honeypot field and a light per-IP throttle. It then saves the entry to every sink that's configured:

| Sink | Enabled when | Notes |
| --- | --- | --- |
| Local JSON file `data/waitlist.json` | Default when not on Vercel (`WAITLIST_FILE_STORE=true/false` to force) | Gitignored. Same email updates the existing entry instead of adding a duplicate. |
| Notion database | `NOTION_TOKEN` + `NOTION_WAITLIST_DATABASE_ID` | Database properties: Name (title), Email (email), Country (text), Profession (text), Career stage (select), Career path (select), LinkedIn (url), Signed up (date). Share the database with your integration. |
| Webhook | `WAITLIST_WEBHOOK_URL` | POSTs `{ type: "veerly.waitlist.signup", entry }`. Works with Zapier, Make, n8n, or your email tool. |

The form only shows success if at least one sink saved the entry. If none did, the visitor sees an error and nothing is
silently dropped. **On Vercel the filesystem is read-only, so set Notion or a webhook before you deploy.**

Copy `.env.example` to `.env.local` to configure.

## Deploy to Vercel (later)

1. Push this folder to a repo and import it in Vercel (framework preset: Next.js).
2. Set `NEXT_PUBLIC_SITE_URL` to the real domain (used for canonical and Open Graph URLs).
3. Set the Notion or webhook env vars above.
4. Optionally set `NEXT_PUBLIC_CONTACT_EMAIL` to show a Contact link in the footer.

## Brand

All visuals come from Mo's official brand kit in `brand-src/` (logo, app icon, Dot mascot, colours, product screens).
Assets in use are copied into `public/brand/` and `app/` (icon.svg, apple-icon.png, favicon.ico).
Fonts: Bricolage Grotesque 800 (headlines), Geist (body), Figtree (only in the in-app style interview-prep mock), loaded via `next/font`.

- Social preview: `app/opengraph-image.png` / `app/twitter-image.png`, rendered from `scripts/og/og.html`
  (`python3 scripts/og/render.py app/opengraph-image.png app/twitter-image.png`).
- Screenshots: `python3 scripts/screenshots.py http://localhost:3210` writes `screenshots/hero.png`, `desktop.png`, `mobile.png`, `form-error.png`
  (add `--submit` to also test a real submission; remember to remove the test entry from `data/waitlist.json`).

## Placeholders to replace before launch

- Domain: none chosen. `veerly.com` belongs to an unrelated design studio, so don't use it.
- Contact email: hidden until `NEXT_PUBLIC_CONTACT_EMAIL` is set.
- Social links, privacy policy, and terms: not on the page yet.
- Payment link: none. Pricing CTAs point to the waitlist until enrolment opens.
