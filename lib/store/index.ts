import type { Signup } from "../types";
import { FileStore } from "./file";
import { UpstashStore } from "./upstash";

/** Primary store: the single source of truth for signups, consents and payments. */
export interface Store {
  readonly name: string;
  get(id: string): Promise<Signup | null>;
  findByEmail(email: string): Promise<Signup | null>;
  list(): Promise<Signup[]>;
  put(s: Signup): Promise<void>;
  remove(id: string): Promise<void>;
}

let cached: Store | null = null;

export function getStore(): Store {
  if (cached) return cached;
  const kind = (process.env.WAITLIST_STORE || "").trim();
  if (kind === "upstash" || (!kind && process.env.UPSTASH_REDIS_REST_URL)) {
    cached = new UpstashStore(process.env.UPSTASH_REDIS_REST_URL!, process.env.UPSTASH_REDIS_REST_TOKEN!);
  } else {
    if (process.env.VERCEL && kind !== "file")
      throw new Error("No durable store configured. On Vercel set UPSTASH_REDIS_REST_URL/TOKEN (WAITLIST_STORE=upstash).");
    cached = new FileStore(process.env.WAITLIST_FILE || "data/waitlist.json");
  }
  return cached;
}

/** Test helper. */
export function setStore(s: Store | null) {
  cached = s;
}
