import { formatLaunchLabel, launchAt, site } from "@/lib/config";
import { buildIcs } from "@/lib/ics";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ event: string }> }) {
  const { event } = await params;
  let ics: string;
  if (event === "launch.ics") {
    ics = buildIcs({
      uid: "veerly-launch-2026@veerly",
      title: "Veerly launches — founding cohort opens",
      description: `Founding enrolment for the Veerly Remote Career Accelerator opens ${formatLaunchLabel()}. ${site.url}`,
      start: launchAt(),
      minutes: 30,
      url: site.url,
    });
  } else if (event === "cohort.ics" && site.cohortStartAt && !Number.isNaN(new Date(site.cohortStartAt).getTime())) {
    ics = buildIcs({
      uid: "veerly-cohort-1@veerly",
      title: "Veerly founding cohort begins",
      description: "Your Veerly Remote Career Accelerator cohort starts today.",
      start: new Date(site.cohortStartAt),
      minutes: 60,
      url: `${site.url}/welcome`,
    });
  } else {
    return new Response("Not found", { status: 404 });
  }
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="veerly-${event}"`,
      "Cache-Control": "no-store",
    },
  });
}
