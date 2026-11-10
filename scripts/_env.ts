/** Minimal .env.local loader for scripts (Next loads it automatically for the app). */
import { existsSync, readFileSync } from "fs";

for (const f of [".env.local", ".env"]) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    const v = m[2];
    process.env[m[1]] = /^["']/.test(v) ? v.replace(/^(["'])(.*)\1.*$/, "$2") : v.replace(/(^|\s+)#.*$/, "").trim();
  }
}
