# WhatsApp templates for Meta approval

Submit these in WhatsApp Manager (or Brevo → WhatsApp → Templates). Category: **Marketing**. Language: **English (en)**.
Only send them to people who ticked "Notify me on WhatsApp when Veerly enrolment opens" (consent v2; v1 signups ticked "…when Veerly launches", which covers the same alert). The script `npm run notify:launch` already filters for that.

Template names must match the env vars: `WHATSAPP_LAUNCH_TEMPLATE` (default `veerly_launch`) and `WHATSAPP_REMINDER_TEMPLATE` (default `veerly_launch_reminder`).
`{{1}}` is the person's first name (the script fills it in).

---

## 1. `veerly_launch` (enrolment opens: send 1 Jan 2027, 9:00 AM WAT)

**Header (text):** Veerly is open

**Body:**
```
Hi {{1}}, founding enrolment for the Veerly Remote Career Accelerator is now open.

Cohort 1 starts on 1 February 2027. Get your personalized remote career plan, plus Job Hunt OS, Portfolio Builder and Interview Preparation, for a one-time ₦10,000 (about $7.99).

You're getting this because you asked to be notified on WhatsApp. Reply STOP to opt out.
```

**Button (URL):** Get founding access → `[your-domain]/#join`

**Sample for review:** `{{1}}` = `Ada`

---

## 2. `veerly_launch_reminder` (24h reminder: 2 Jan 2027)

**Body:**
```
Hi {{1}}, a quick reminder that Veerly founding enrolment is open. It's a one-time ₦10,000 (about $7.99), with no subscription.

Reply STOP to stop WhatsApp messages from Veerly.
```

**Button (URL):** Join Veerly → `[your-domain]/#join`

**Sample for review:** `{{1}}` = `Tunde`

---

## Approval tips

- Keep the wording factual. Avoid urgency claims you can't back up ("only 3 spots left").
- Add your real domain to the URL button before submitting. Meta rejects placeholder links.
- Meta also offers a built-in "Stop promotions" quick-reply button for marketing templates. You can add it as well as the STOP line.
- Send a test to your own number after approval: `npm run notify:launch -- --send --limit 1` with a store that contains only your own test signup.
