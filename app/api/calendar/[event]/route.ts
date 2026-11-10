import { site } from "@/lib/config";
import { cohortOne, enrolAt, formatWhen } from "@/lib/launch";
import { buildIcs } from "@/lib/ics";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ event: string }> },
) {
  const { event } = await params;
  let ics: string;
  if (event === "launch.ics") {
    ics = buildIcs({
      uid: "veerly-enrolment-2027@veerly",
      title: "Veerly founding enrolment opens",
      description: `Founding enrolment for the Veerly Remote Career Accelerator opens ${formatWhen(enrolAt())}. Cohort 1 starts ${formatWhen(new Date(cohortOne().startsAt))}. ${site.url}`,
      start: enrolAt(),
      minutes: 30,
      url: site.url,
    });
  } else if (event === "cohort.ics") {
    ics = buildIcs({
      uid: "veerly-cohort-1@veerly",
      title: "Veerly Cohort 1 begins",
      description: "Your Veerly Remote Career Accelerator cohort starts today.",
      start: new Date(cohortOne().startsAt),
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
