import { toCsv } from "@/lib/csv";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Protected by middleware.ts (basic auth). Double-check in case the matcher changes.
  if (!process.env.ADMIN_PASSWORD) return new Response("Not found", { status: 404 });
  const list = await getStore().list();
  return new Response(toCsv(list), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="veerly-waitlist-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
