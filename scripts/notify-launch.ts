/**
 * Send the approved WhatsApp launch template to everyone who opted in.
 *
 *   npm run notify:launch                       # dry run (default): prints what would be sent
 *   npm run notify:launch -- --send             # really sends (needs WHATSAPP_* env vars)
 *   npm run notify:launch -- --template reminder --limit 200 --batch 20 --delay 1500
 *
 * Safety: refuses to send without --send AND WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID.
 * Skips anyone already notified for that template (idempotent), honours a --limit
 * (new Meta business portfolios can reach 250 unique people per rolling 24h), logs every
 * attempt to data/notify-log.jsonl, and retries 429/5xx with backoff.
 */
import "./_env";
import { appendFileSync, mkdirSync } from "fs";
import { getStore } from "../lib/store";
import type { Signup } from "../lib/types";
import { buildTemplatePayload, sendTemplate, whatsappConfig, WhatsAppError } from "../lib/whatsapp";

const args = process.argv.slice(2);
const flag = (n: string) => args.includes(`--${n}`);
const opt = (n: string, d: string) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};

const SEND = flag("send");
const kind = opt("template", "launch") as "launch" | "reminder";
const limit = Number(opt("limit", "250"));
const batchSize = Number(opt("batch", "20"));
const delayMs = Number(opt("delay", "1500"));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const log = (entry: Record<string, unknown>) => {
  mkdirSync("data", { recursive: true });
  appendFileSync("data/notify-log.jsonl", JSON.stringify({ at: new Date().toISOString(), ...entry }) + "\n");
};

async function main() {
  const cfg = whatsappConfig();
  const template = kind === "reminder" ? cfg.reminderTemplate : cfg.launchTemplate;
  const sentKey = kind === "reminder" ? "whatsappReminder" : "whatsappLaunch";

  if (SEND && (!cfg.token || !cfg.phoneNumberId)) {
    console.error("Refusing to send: set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID (and an approved template).");
    process.exit(1);
  }

  const store = getStore();
  const all = await store.list();
  const eligible = all.filter((s: Signup) => s.consent.whatsapp.granted && s.whatsapp && !s.notifications?.[sentKey]);
  const queue = eligible.slice(0, limit);

  console.log(`${SEND ? "SEND" : "DRY RUN"} · template "${template}" (${cfg.language}) · store: ${store.name}`);
  console.log(`${all.length} signups · ${eligible.length} opted in and not yet notified · sending to ${queue.length} (limit ${limit})`);

  let ok = 0;
  let failed = 0;
  for (let i = 0; i < queue.length; i += batchSize) {
    const batch = queue.slice(i, i + batchSize);
    for (const s of batch) {
      const firstName = s.name.split(" ")[0];
      const payload = buildTemplatePayload(s.whatsapp!, template, cfg.language, [firstName]);
      if (!SEND) {
        console.log(`  would send → ${s.whatsapp!.replace(/\d(?=\d{4})/g, "•")} (${firstName})`);
        continue;
      }
      let attempt = 0;
      for (;;) {
        try {
          const messageId = await sendTemplate(payload);
          const fresh = (await store.get(s.id)) || s;
          await store.put({
            ...fresh,
            notifications: { ...fresh.notifications, [sentKey]: { sentAt: new Date().toISOString(), messageId } },
          });
          log({ id: s.id, template, status: "sent", messageId });
          ok++;
          break;
        } catch (e) {
          const err = e as WhatsAppError;
          if (err.retryable && attempt < 3) {
            attempt++;
            await sleep(1000 * 2 ** attempt);
            continue;
          }
          log({ id: s.id, template, status: "failed", error: err.message, httpStatus: err.status });
          console.error(`  failed ${s.id}: ${err.message}`);
          failed++;
          break;
        }
      }
    }
    if (SEND && i + batchSize < queue.length) await sleep(delayMs);
  }
  if (SEND) console.log(`Done: ${ok} sent, ${failed} failed. Log: data/notify-log.jsonl`);
  else console.log("Nothing was sent. Re-run with --send once your template is approved.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
