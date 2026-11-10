# Veerly landing — design spec (v5)

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
**No product imagery (v4).** The site carries no screenshots or app-UI images; Veerly is described only from the plan. Sections earn their richness from type scale, numbering, rules and the yellow countdown.

1. **Stage (hero, `--stage` #0075AD), fills the first viewport on desktop.** Two-line H1 across the top. Below: lede, white "Join the waitlist" + "See what's inside", price line (left 6 cols); **the yellow countdown board** (right 5 cols, on a navy `#002B42` panel). At the foot of the stage a 1px-ruled contents strip, `01 Job Hunt OS · 02 Portfolio Builder · 03 Interview Preparation System` (numbers in yellow), which anchors into the numbered rows below and hands the stage over to the next section.
2. **Three systems: numbered editorial rows.** Two-tone H2 + "Delivered in Notion" note. Then three full-width rows divided by 1px rules: a large brand-blue numeral (2 cols), the system name at H3 display size with its one-line purpose and how it's personalized (5 cols), and "What it includes" as a 4-item ruled list (4 cols).
3. **Personalization.** H2 + paragraph left; right a 2x2 text grid divided by 1px lines; below, a ruled comparison table, labelled "Illustrative example".
4. **Ten career paths.** Vercel-style 1px cell grid, 5 x 2, text only.
5. **Join (#join).** Left: what happens next as a dated timeline (Today, 1 Dec 9:00 AM WAT, at enrolment, January 2027). Right: the form card (shadcn Field, Input, NativeSelect, Select, Checkbox, Button), WhatsApp with +234 default, two separate unticked consent boxes, optional step 2, success + add-to-calendar. After launch the card becomes Paystack checkout.
6. **Pricing band (Ink).** $7.99 large, ≈ ₦10,000 one-time; what's included in two columns; CTA; compact yellow countdown repeats here.
7. **FAQ.** H2 left, shadcn Accordion right.
8. **Footer.** Logo, belief line, Privacy, Terms, the "does not guarantee employment" line.

## Motion (GSAP + ScrollTrigger, restrained)
- One authored entrance: H1 lines, lede and countdown tiles rise 16px and fade in once, power3/expo out, 0.9s, staggered 60ms.
- Each numbered system row rises 24px and fades in once as it enters.
- Join timeline: the vertical progress line draws as you scroll.
- Countdown seconds tick with a 180ms vertical slide.
- `prefers-reduced-motion: reduce` turns all of it off (gsap.matchMedia); everything is visible by default without JS.

## Browser surfaces
Selection white on ink, caret brand blue, focus ring 2px brand blue with 2px offset, link underline offset 3px, tabular numerals, custom thin scrollbar in line colour.
