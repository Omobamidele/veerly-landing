import type { Signup } from "../types";
import type { Store } from "./index";

/**
 * Durable store for Vercel using Upstash Redis over REST (free tier available, no SDK needed).
 * Keys: veerly:signup:<id> (JSON), veerly:email:<email> -> id, veerly:signups (set of ids).
 */
export class UpstashStore implements Store {
  readonly name = "upstash";
  constructor(
    private url: string,
    private token: string,
  ) {
    if (!url || !token) throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required");
  }

  private async cmd<T = unknown>(...args: (string | number)[]): Promise<T> {
    const res = await fetch(this.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(`Upstash: ${json.error || res.status}`);
    return json.result as T;
  }

  async get(id: string) {
    const raw = await this.cmd<string | null>("GET", `veerly:signup:${id}`);
    return raw ? (JSON.parse(raw) as Signup) : null;
  }
  async findByEmail(email: string) {
    const id = await this.cmd<string | null>("GET", `veerly:email:${email.toLowerCase()}`);
    return id ? this.get(id) : null;
  }
  async list() {
    const ids = await this.cmd<string[]>("SMEMBERS", "veerly:signups");
    if (!ids.length) return [];
    const raws = await this.cmd<(string | null)[]>("MGET", ...ids.map((i) => `veerly:signup:${i}`));
    return raws.filter(Boolean).map((r) => JSON.parse(r as string) as Signup);
  }
  async put(s: Signup) {
    await this.cmd("SET", `veerly:signup:${s.id}`, JSON.stringify(s));
    await this.cmd("SET", `veerly:email:${s.email}`, s.id);
    await this.cmd("SADD", "veerly:signups", s.id);
  }
  async remove(id: string) {
    const s = await this.get(id);
    if (s) await this.cmd("DEL", `veerly:email:${s.email}`);
    await this.cmd("DEL", `veerly:signup:${id}`);
    await this.cmd("SREM", "veerly:signups", id);
  }
}
