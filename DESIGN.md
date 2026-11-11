# Veerly landing — design spec (v5–v8)

Mode: **Persuade** (a launch page: the visitor should understand the offer in one viewport, feel the date approaching, and leave a WhatsApp number).
Direction (pinned by Mo's brief, no concept roll): **"Blue stage, yellow signal."** Lemon Squeezy's true blue (`#0075AD`, their `--blue-700`) as the stage, at product-site precision. One saturated moment on the whole page: her yellow countdown.

## What the references taught us (studied 10 Nov 2026)
| Reference | What we take | What we leave |
|---|---|---|
| **Linear** (linear.app) | Left-aligned headline, product UI directly under the hero, bleeding into the next section; two-tone section headings (ink + muted) | The near-black canvas |
| **Stripe** (stripe.com) | Two-tone headline sentences; one accent colour for actions only | The animated gradient wave |
| **Cal.com** (cal.com) | Tight nav, one solid CTA, confident whitespace | Logo wall (we have no customers yet; never invent one) |
| **Raycast** (raycast.com) | All saturated colour concentrated in ONE moment, so it reads as an event | Dark-only theme |
| **Vercel** (vercel.com) | 1px grid cells for lists of equal items (our 10 career paths) instead of cards or pills | Monochrome everything |
| **Resend** (resend.com) | Restraint: generous space, hairline borders, few type sizes | Serif display |

## Anti-patterns refused (impeccable craft floor)
No gradient blobs, no gradient text, no emoji or icon-tile card grids, no three equal feature cards, no eyebrow/kicker labels over headings, no pills/badges for decoration, no "Trusted by" rows, no invented stats or testimonials, no side-stripe borders, no glow halos, no bounce easing, no pulsing dots, no grain/noise overlays.

## Colour (Lemon Squeezy true blue, role-locked; v5)
History: v1–v3 violet (`#4A1FD6`/`#6A45FF`) → v4 Lemon Squeezy hero colour `#5423E7` → **v5: Mo picked the true blue, `#0075AD`**. It is now the only palette: the `#5423E7` default and the `?palette` switch are gone, and no blue-violet value remains in the CSS, icons, logos, OG images, theme-color or manifest.

Source, fetched 10 Nov 2026: lemonsqueezy.com homepage and its CSS bundle `https://cdn.prod.website-files.com/6347244ba8d63489ba51c08e/css/lemon-squeezy-staging.shared.d3b11bb0e.min.css` (`:root` custom properties). Reference screenshot: `screenshots/ref-lemonsqueezy.png`.

| Lemon Squeezy value | Hex | CSS source | Veerly use |
|---|---|---|---|
| Blue 700 | `#0075AD` | `--blue-700` | `--stage`, `--brand`: hero, primary buttons, links, numerals, focus rings, checked states, theme-color, manifest, favicon/app icons, logo mark, OG button |
| Blue 50 | `#F0FAFF` | `--blue-50-501` | `--tint`: selected states, shadcn `--secondary`/`--accent` |
| Blue 100 | `#DBF3FF` | `--blue-100` | `--tint-line`: tinted borders |
| Blue 600 / 500 | `#0090D6` / `#00ACFF` | `--blue-600`, `--blue-500` | **Not used**: white text on them is only 3.5:1 / 2.4:1 |
| (their hero, for the record) | `#5423E7` | `--blue` = `--purple-600`, meta theme-color | Rejected by Mo (reads violet) |

Derived (same ≈200° hue as `--blue-700`, not in their CSS):
| Token | Hex | Role |
|---|---|---|
| `--brand-press` | `#00608E` | Hover/pressed |
| `--navy` / `--stage-deep` | `#002B42` | **Countdown panel** under the yellow tiles; soft bottom-right shade on the stage |

Neutrals were re-tuned from violet-grey to blue-grey so the purple cast doesn't fight the blue (same roles, same contrast class):
| Token | v4 | v5 | Check |
|---|---|---|---|
| Ink | `#17122E` | `#0D1B26` | 16.7:1 on ground; 12.6:1 on yellow; pricing band surface |
| Ink 2 | `#4B4763` | `#44525E` | 7.7:1 on ground |
| Ink 3 | `#6B6782` | `#5F6C77` | 5.2:1 on ground |
| Ground | `#FAFAFC` | `#F8FAFB` | Page background |
| Line | `#E6E4EE` | `#E3E8EC` | 1px rules |
| Input border | `#C9C5D6` | `#C5CED5` | Form controls |
| Proof yellow | `#FFD84D` | unchanged | Countdown tiles + logo flag only |
| Proof green | `#08714F` | unchanged | Success only |

Contrast on the stage: white on `#0075AD` is 5.1:1, so all small text on the stage is now solid white (or 95%); 70% white is used only for the second H1 line (large display text, 3.3:1). `#0075AD` as text/links on ground: 4.8:1. The contents-strip numerals switched from yellow (3.7:1 on the blue, too low for 14px text) to solid white.

**Yellow countdown on the sky blue.** `#FFD84D` against `#0075AD` is only 3.7:1, so the tiles were losing presence. Fix (yellow unchanged): the hero countdown now sits on a **navy `#002B42` panel** (`.countdown-panel`, 20px radius, 1px inner white/8 edge, soft 24px drop shadow), which gives the tiles 10.7:1 against their immediate surround, so the board reads as one deliberate "departure board" object on the stage. Tiles also gained a 2px darker bottom inner edge and a slightly deeper shadow. The launched-state yellow panel sits on the same navy base. In the pricing band the strip countdown already sits on Ink (yellow 12.6:1), so it is unchanged.

Rhythm notes taken from Lemon Squeezy (not their layout or content): large display type with tight tracking, generous vertical padding between sections, white solid primary button on the coloured hero, a hard switch from the coloured hero to a light ground.

Strategy: **Committed** at the top (the stage owns the first viewport), **Restrained** below (ground + ink + one brand-blue accent), with the yellow reserved for the countdown so it is the signature moment.

## Type
- Display: **Bricolage Grotesque** (variable, opsz). H1 `clamp(44px, 6.4vw, 92px)`, weight 700, tracking -0.035em, line-height 0.98. H2 `clamp(32px, 3.8vw, 52px)`, weight 700, tracking -0.03em, line-height 1.04, two-tone (ink + 45% ink).
- Body: **Geist**. Body 16/1.6, lede 19/1.5, UI 14/1.4, captions 13/1.4. Tabular numerals for all numbers.
- Countdown digits: Bricolage 700, `clamp(40px, 5vw, 64px)`, tabular, ink on yellow.
- Max measure 62ch for running text. Sentence case everywhere.

## Grid and spacing
- Container 1200px + 32px gutters (20px mobile). 12 columns.
- 4px base scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Sections 128px apart on desktop, 88px on mobile. More space above a heading than below it.
- Radii: 8px controls and buttons, 12px tiles and tables, 16px the form card. No full pills.
- Elevation is declared once per element: a 1px border on light surfaces, or one soft offset shadow for the form card and countdown tiles. Never both.

## Page anatomy
Sections earn their richness from type scale, numbering, rules and the yellow countdown. **v7** adds real product screenshots of the Virtual Assistant Career OS, in the same `rounded-xl` / 1px-line figure frames as the personalization table. No invented UI, metrics or testimonials.

1. **Stage (hero, `--stage` #0075AD), fills the first viewport on desktop.** Two-line H1 across the top. Below: lede, white "Join the waitlist" + "See what's inside", price line (left 6 cols); **the yellow countdown board** (right 5 cols, on a navy `#002B42` panel). At the foot of the stage a 1px-ruled contents strip, `01 Job Hunt OS · 02 Portfolio Builder · 03 Interview Preparation System` (numbers in yellow), which anchors into the numbered rows below and hands the stage over to the next section.
2. **Three systems: numbered editorial rows.** Two-tone H2 + "Delivered in Notion" note. Then three full-width rows divided by 1px rules: a large brand-blue numeral (2 cols), the system name at H3 display size with its one-line purpose and how it's personalized (5 cols), and "What it includes" as a 4-item ruled list (4 cols).
3. **Personalization.** H2 + paragraph left; right a 2x2 text grid divided by 1px lines; below, a ruled comparison table, labelled "Illustrative example".
4. **Ten career paths.** Vercel-style 1px cell grid, 5 x 2, text only.
5. **Inside your Veerly workspace (v7).** Real cropped screenshots of the Virtual Assistant Career OS in Notion: the home, job-hunt pipeline, cohort coach, portfolio builder, interview prep, resource library and Job Hunt OS. A two-tone H2 states this is the VA path; the lede says the other nine paths follow the same system. Each shot sits in a `rounded-xl` frame with a 1px `border-line` and a short caption in a `bg-ground` bar, matching the comparison table. Images are `next/image` WebP in `public/product/`, with `sizes`, intrinsic width/height (no layout shift) and default lazy loading.
6. **Choose your Virtual Assistant level (v8, #levels).** Three equal cells in the same 1px-grid language as the career paths (`rounded-xl`, `bg-line` gaps, white cells). Each cell has the level name, a one-line "who it's for", short "You'll learn" and "You'll be able to" lists (brand-blue checks, as in the systems rows), and a "Choose Beginner" (etc.) button. The selected cell uses `--tint`. No badges, no "most popular", no per-level prices (the price is the same). A quiet line under the grid states these are skills, not a job guarantee. Cohort 1 dates (1–28 February 2027) and "each level gets its own workspace" sit in the heading block.
7. **Join (#join).** Left: what happens next as a dated timeline (Today, 1 Dec 9:00 AM WAT, at enrolment, January 2027). Right: the form card (shadcn Field, Input, NativeSelect, Select, Checkbox, Button), WhatsApp with +234 default, two separate unticked consent boxes, optional step 2, success + add-to-calendar. After launch the card becomes Paystack checkout.
8. **Pricing band (Ink).** $7.99 large, ≈ ₦10,000 one-time; what's included in two columns; CTA; compact yellow countdown repeats here.
9. **FAQ.** H2 left, shadcn Accordion right.
10. **Footer.** Logo, belief line, Privacy, Terms, the "does not guarantee employment" line.

## Motion (GSAP + ScrollTrigger, restrained)
- One authored entrance: H1 lines, lede and countdown tiles rise 16px and fade in once, power3/expo out, 0.9s, staggered 60ms.
- Each numbered system row, and each row of workspace screenshots, rises 24px and fades in once as it enters.
- Join timeline: the vertical progress line draws as you scroll.
- Countdown seconds tick with a 180ms vertical slide.
- `prefers-reduced-motion: reduce` turns all of it off (gsap.matchMedia); everything is visible by default without JS.

## Browser surfaces
Selection white on ink, caret brand blue, focus ring 2px brand blue with 2px offset, link underline offset 3px, tabular numerals, custom thin scrollbar in line colour.

## v6: local currency pricing
- **One editable table:** `lib/pricing.ts`. Prices are fixed, rounded and hand-set, with no live exchange rates. Each is roughly US$7.99 at the 9–10 Nov 2026 mid-rates: ₦10,000, $7.99, £5.99, €6.99, CA$10.99, GH₵95, Ksh 1,000, R 129, ₹749, A$11.49. Amounts are formatted with `Intl.NumberFormat` using a per-currency locale. CAD and AUD use the en-US locale so they read CA$ and A$, never a bare $.
- **Default currency:** the visitor's saved choice (`localStorage["veerly.currency"]`) comes first. Then the `x-vercel-ip-country` header, then the browser timezone (Africa/Lagos → NGN), then the browser locale region, then USD.
- **Selector:** the shadcn Select at size sm, sitting next to every price: the hero price line (`tone="stage"`), the pricing band (`tone="dark"`) and the checkout card (full width, `detailed`). All selectors stay in sync. On the stage the trigger uses a black/15 fill, because a white/10 fill only gave 4.2:1 for white text.
- **Honest checkout:** Paystack charges NGN when NGN is chosen. For any other currency it charges USD if `PAYSTACK_ENABLE_USD=true`, otherwise NGN. When the shown currency differs from the charged one, a quiet 13px note appears under the price, worded to match the configuration (e.g. "Shown in GBP for reference. You'll pay in naira (₦10,000) at checkout; your bank converts it."). The checkout button always shows the amount actually charged.

## v6: the countdown always counts down
- **Rolling target in `lib/cohorts.ts`** (superseded pre-launch by v6.1 below, which shows no countdown before launch). After launch it reads "Next cohort starts in", with the cohort name shown at the right of the heading. The target is the next listed cohort; once the list runs out, the fallback is the first Monday of next month at 9:00 AM WAT.
- **Never zero:** the board never shows zeros or a static "open" panel. The yellow `#FFD84D` tiles stay on the navy panel. `?preview=launched` shows the next-cohort countdown.
- **Placeholder dates:** the listed dates (Cohort 1 Mon 4 Jan 2027, Cohort 2 Mon 1 Feb 2027, Cohort 3 Mon 1 Mar 2027, all 9:00 WAT) are placeholders until Mo confirms them.

## v6.1: no countdown before launch (Mo's decision; she starts promoting on 1 Dec 2026)
- **Before `NEXT_PUBLIC_LAUNCH_AT`** (1 Dec 2026, 9:00 AM WAT): no timer anywhere. `pickCountdownTarget` returns `null` in this period.
  - **Hero:** the same navy panel holds a calm, static message: "Founding enrolment / Opens 1 December 2026 / Join the waitlist and we'll message you on WhatsApp when it opens. Nothing to pay until then." The date line and "first cohort January 2027" sit below it.
  - **Pricing band:** a single quiet line: "Founding enrolment opens 1 December 2026, 9:00 AM WAT. Nothing to pay until then."
  - **Pre-launch copy:** contains no countdown or "opens in" wording.
- **From launch onward:** the yellow `#FFD84D` tiles on navy count to Cohort 1 (4 Jan 2027, 9:00 WAT, a placeholder until Mo confirms), then roll through `lib/cohorts.ts` and the first-Monday fallback. `?preview=launched` shows this state. The v6 "Doors open in" countdown is gone.

## v6.2: the confirmed timeline (`lib/launch.ts`, all 9:00 AM WAT)
| Phase | From | Hero slot | Pricing band | Checkout |
|---|---|---|---|---|
| prelaunch | now → 1 Dec 2026 | Calm navy panel: "Founding enrolment / Opens 1 January 2027", waitlist nudge, "Cohort 1 starts 1 February 2027" | One quiet line: enrolment opens 1 January 2027, nothing to pay | Waitlist only; `/api/checkout` → 409 `enrolment_not_open` |
| promo | 1 Dec 2026 | Yellow tiles on navy counting to **Cohort 1 (1 Feb 2027)**; footer "· Enrolment opens 1 January 2027" | Strip countdown + "Enrolment opens 1 January 2027. Nothing to pay until then." | Waitlist only; 409 |
| enrol | 1 Jan 2027 | Same countdown; footer "· enrolment open, ₦10,000 one-time" | Strip countdown | Paystack checkout live |

- **After Cohort 1:** the countdown rolls to Cohort 2 on 1 Mar 2027 and Cohort 3 on 5 Apr 2027, both placeholders. After that it falls back to the first Monday of next month.
- **Previews:** `?preview=prelaunch|promo|enrol`. `launched` still works and means enrol.

## v6.3 — Cohort coach (`/coach`)

- One commitment per cohort, not a task gate: every expectation is visible from the start, grouped by Job Hunt OS, Portfolio Builder, Interview Preparation System and Cohort rhythm; ticking is free-form.
- White ground to sit naturally inside a Notion page; single navy `.countdown-panel` with the same yellow `#FFD84D` flap tiles as the landing page; blue `#0075AD` for progress, labels and actions; `--tint` for the coach note. No violet.
- Windows align to the cohort start: starting early shows "Before day one" focus; late starters share the cohort finish line.
- Tone: calm and never shaming. The closed state leads with what was finished and how to keep going. No job promises.
- Accessibility: Radix alert dialogs (focus trap, Esc = "Not yet"), labelled checkboxes in fieldsets, `role=progressbar`, polite live summary for the countdown (seconds aren't announced), no entrance animation; transitions disabled under reduced motion.

## v7 — Inside your Veerly workspace

- Real product screenshots of the Virtual Assistant Career OS, taken from the live Notion pages (sidebar hidden) and cropped with PIL: Notion top bar and breadcrumbs, the right-edge scrollbar, the help bubble, the outline control, the dark “Powered by Netlify” badge on the cohort-coach embed, and the cut-off Saved column on the applications board are all removed. Tight bottom crops keep every frame a complete composition.
- Used: `home`, `home-coach`, `job-hunt`, `job-hunt-board`, `portfolio`, `interview`, `resources`. Not used: `learning-path` (cards wrapped mid-word) and `home-schedule` (Notion “upgrade for charts” notice).
- Optimized WebP in `public/product/`. The section sits after the ten career paths and before Join. Captions are short and factual, including “Resource library: 31 study pages” (the count stated on the VA Career OS itself).
- No violet, no stock UI, no invented metrics or testimonials, and no job promise.
