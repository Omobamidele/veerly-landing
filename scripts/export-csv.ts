/** Export signups, consents and payments to CSV:  npm run export:csv -- [out.csv] */
import "./_env";
import { writeFileSync } from "fs";
import { toCsv } from "../lib/csv";
import { getStore } from "../lib/store";

(async () => {
  const out = process.argv[2] || `data/waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
  const list = await getStore().list();
  writeFileSync(out, toCsv(list));
  console.log(`Wrote ${list.length} rows to ${out}`);
})();
