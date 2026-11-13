import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Waitlist admin · Veerly", robots: { index: false, follow: false } };

export default async function AdminWaitlist() {
  if (!process.env.ADMIN_PASSWORD) notFound();
  const list = (await getStore().list()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const addonRows = list
    .flatMap((s) => (s.addons ?? []).map((a) => ({ s, a })))
    .sort((x, y) => y.a.createdAt.localeCompare(x.a.createdAt));
  const count = (f: (s: (typeof list)[number]) => boolean) => list.filter(f).length;
  const stats = [
    ["Signups", list.length],
    ["Email consent", count((s) => s.consent.email.granted)],
    ["WhatsApp consent", count((s) => s.consent.whatsapp.granted)],
    ["Profile completed", count((s) => Boolean(s.profile.completedAt))],
    ["Paid", count((s) => s.payment.status === "paid")],
    ["Extra levels paid", list.reduce((n, s) => n + (s.addons ?? []).filter((a) => a.status === "paid").length, 0)],
  ] as const;
  return (
    <main className="admin wrap">
      <div className="admin-head">
        <h1>Waitlist</h1>
        <a className="btn btn-secondary" href="/admin/waitlist/export">
          Export CSV
        </a>
      </div>
      <dl className="admin-stats">
        {stats.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Signed up</th>
              <th>Name</th>
              <th>Email</th>
              <th>WhatsApp</th>
              <th>Consent</th>
              <th>Path</th>
              <th>Level</th>
              <th>Chosen by</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id}>
                <td>{new Date(s.createdAt).toLocaleString("en-GB", { timeZone: "Africa/Lagos" })}</td>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.whatsapp || "—"}</td>
                <td>
                  {[s.consent.email.granted && "Email", s.consent.whatsapp.granted && "WhatsApp"].filter(Boolean).join(", ") || "—"}
                </td>
                <td>{s.profile.careerPath || "—"}</td>
                <td>{s.profile.level || "—"}</td>
                <td>{s.profile.levelSource === "quiz" ? "Level check" : s.profile.levelSource === "manual" ? "Picked directly" : "—"}</td>
                <td>{s.payment.status}</td>
              </tr>
            ))}
            {!list.length && (
              <tr>
                <td colSpan={9}>No signups yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <h2 className="mt-10 text-xl font-semibold">Extra levels</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ordered</th>
              <th>Email</th>
              <th>Path</th>
              <th>Already had</th>
              <th>Adding</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Checked against a payment</th>
            </tr>
          </thead>
          <tbody>
            {addonRows.map(({ s, a }) => (
              <tr key={a.reference}>
                <td>{new Date(a.createdAt).toLocaleString("en-GB", { timeZone: "Africa/Lagos" })}</td>
                <td>{s.email}</td>
                <td>{a.path}</td>
                <td>{a.ownedLevel || "—"}</td>
                <td>{a.addonLevel}</td>
                <td>
                  {(a.amount / 100).toLocaleString("en-US")} {a.currency}
                </td>
                <td>{a.status}</td>
                <td>{a.verified ? "Yes" : "No: check by hand before sending the link"}</td>
              </tr>
            ))}
            {!addonRows.length && (
              <tr>
                <td colSpan={8}>No extra levels yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
