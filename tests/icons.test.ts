import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..");
const ALLOWED = new Set(["#002b42", "#0075ad", "#ffd84d", "#ffffff", "#fff", "#e6f4fb", "#f0faff"]);

test("every Veerly icon is a 24-grid SVG in brand colours only", () => {
  const dir = join(ROOT, "brand-src/icons");
  const files = readdirSync(dir).filter((f) => f.endsWith(".svg"));
  assert.ok(files.length >= 60, `expected the full set, found ${files.length}`);
  for (const f of files) {
    const svg = readFileSync(join(dir, f), "utf8");
    assert.match(svg, /viewBox="0 0 24 24"/, f);
    for (const c of svg.toLowerCase().match(/#[0-9a-f]{3,6}\b/g) ?? []) {
      assert.ok(ALLOWED.has(c), `${f} uses off-brand colour ${c}`);
    }
  }
});

test("site code uses no third-party icon library", () => {
  const banned = /from ["'](lucide-react|@heroicons\/|react-icons|@radix-ui\/react-icons|@tabler\/icons)/;
  const walk = (d: string): string[] =>
    readdirSync(d).flatMap((n) => {
      const p = join(d, n);
      return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|jsx?)$/.test(n) ? [p] : [];
    });
  for (const f of ["app", "components", "lib"].flatMap((d) => walk(join(ROOT, d)))) {
    assert.doesNotMatch(readFileSync(f, "utf8"), banned, f);
  }
});
