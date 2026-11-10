import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { setStore } from "../lib/store";

/** Point the file store at a fresh temp file and clear any external sinks. */
export function freshStore() {
  const dir = mkdtempSync(path.join(tmpdir(), "veerly-test-"));
  process.env.WAITLIST_FILE = path.join(dir, "waitlist.json");
  for (const k of [
    "BREVO_API_KEY",
    "NOTION_TOKEN",
    "WAITLIST_WEBHOOK_URL",
    "UPSTASH_REDIS_REST_URL",
    "VERCEL",
  ])
    delete process.env[k];
  setStore(null);
  return process.env.WAITLIST_FILE;
}
