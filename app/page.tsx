import { IconArrowDown, IconCheck } from "@/components/icons/veerly-icons";
import Countdown from "@/components/Countdown";
import EnrolBanner from "@/components/EnrolBanner";
import JoinHeading from "@/components/JoinHeading";
import LevelChoice from "@/components/LevelChoice";
import { LevelProvider } from "@/components/LevelProvider";
import { LaunchProvider } from "@/components/LaunchProvider";
import LaunchCta, { NavCta } from "@/components/LaunchCta";
import Motion from "@/components/Motion";
import PricingCta from "@/components/PricingCta";
import SignupCard from "@/components/SignupCard";
import { Footer, Nav } from "@/components/SiteChrome";
import Workspace from "@/components/Workspace";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { paymentsEnabled, site } from "@/lib/config";
import { headers } from "next/headers";
import {
  CheckoutNote,
  CurrencyProvider,
  CurrencySelect,
  Price,
} from "@/components/Currency";
import { pricing } from "@/lib/config";
import {
  cohortOne,
  cohorts,
  currentPhase,
  enrolAt,
  formatDay,
  formatShort,
  formatWhen,
  parsePhase,
  promoAt,
} from "@/lib/launch";
import { countryFromHeaders } from "@/lib/geo";
import {
  FALLBACK_CURRENCY,
  currencyForCountry,
  formatPrice,
} from "@/lib/pricing";

export const dynamic = "force-dynamic"; // launch state + ?preview depend on request time

type System = {
  id: string;
  n: string;
  name: string;
  blurb: string;
  shaped: string;
  points: string[];
};

const systems: System[] = [
  {
    id: "job-hunt-os",
    n: "01",
    name: "Job Hunt OS",
    blurb: "One organised place to find and pursue remote roles.",
    shaped: "Your target roles and companies come from your assessment.",
    points: [
      "Application and follow-up tracker",
      "Company and opportunity database",
      "Networking and recruiter CRM",
      "Weekly job-search planner",
    ],
  },
  {
    id: "portfolio-builder",
    n: "02",
    name: "Portfolio Builder",
    blurb: "Show what you can do, whatever your field.",
    shaped: "Projects are matched to your remote career path.",
    points: [
      "Portfolio structure for your path",
      "Practical project templates",
      "Documentation guides",
      "Progress tracker",
    ],
  },
  {
    id: "interview-prep",
    n: "03",
    name: "Interview Preparation System",
    blurb: "Practice built around the role you actually want.",
    shaped: "Questions and exercises follow the roles you're targeting.",
    points: [
      "Role-specific preparation",
      "Common questions and exercises",
      "Mock interview prep",
      "Interview tracking and feedback",
    ],
  },
];

const personalization: [string, string][] = [
  [
    "You take a short assessment",
    "Your profession or interest, skills and experience, preferred remote path, career stage, target roles and goals.",
  ],
  [
    "Your plan adapts to your answers",
    "Skills to develop, roles to pursue, companies to target and projects to build.",
  ],
  [
    "Your workspace follows your plan",
    "Job search, portfolio and interview prep are shaped around your path, not a generic checklist.",
  ],
  [
    "You learn to tell your story",
    "How to present the experience you already have to remote employers.",
  ],
];

const comparison: [string, string, string][] = [
  [
    "Roles to target",
    "Remote customer success and account management",
    "Remote design and creative services",
  ],
  [
    "Portfolio project",
    "A customer onboarding and retention plan",
    "Case studies that explain the thinking behind the work",
  ],
  [
    "Interview practice",
    "Difficult customer conversations",
    "Presenting a portfolio and taking feedback live",
  ],
];

const paths: [string, string][] = [
  ["Sales and Business Development", "SDR, BDR, account executive"],
  ["Marketing and Content", "Content marketer, social media manager"],
  [
    "Customer Success and Support",
    "Customer success manager, support specialist",
  ],
  ["Business Operations", "Operations associate, operations manager"],
  [
    "Administration and Virtual Assistance",
    "Virtual assistant, executive assistant",
  ],
  ["Project Management", "Project coordinator, project manager"],
  ["Data and Analytics", "Data analyst, BI analyst"],
  ["Software and Technology", "Developer, QA tester, IT support"],
  ["GTM and Revenue Operations", "RevOps specialist, GTM engineer"],
  ["Design and Creative Services", "Graphic, brand and product designer"],
];

const included = [
  "One Notion workspace for your path and level",
  "Inside it: Job Hunt OS, Portfolio Builder and Interview Preparation System",
  "Your personalized career plan",
  "Cohort activities and resources",
  "Keep your Notion resources after the cohort",
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const preview = typeof sp.preview === "string" ? sp.preview : null;
  const forced =
    parsePhase(preview) ?? parsePhase(process.env.NEXT_PUBLIC_LAUNCH_STATE);
  const now = Date.now();
  const phase = currentPhase(now, preview);
  const enrol = enrolAt();
  const label = formatWhen(enrol); // enrolment (payment) opens
  const shortLabel = formatShort(enrol);
  const c1 = cohortOne();
  const c1Day = formatDay(new Date(c1.startsAt));
  const c1Window = "1–28 February 2027";
  const payments = paymentsEnabled();
  const usdEnabled = pricing.usdEnabled;
  const country = countryFromHeaders(await headers());
  const initialCurrency = currencyForCountry(country) ?? FALLBACK_CURRENCY;
  const ngn = formatPrice("NGN");
  const usd = formatPrice("USD");

  const timeline: [string, string, string][] = [
    [
      "Today",
      "Join the waitlist",
      "Your name, email and WhatsApp number. It takes under a minute.",
    ],
    [
      label,
      "Enrolment opens",
      "We message you on WhatsApp and by email the moment you can enrol and pay.",
    ],
    [
      `From ${shortLabel}`,
      "Choose your path and level, then pay once",
      `Pick a career path and Beginner, Intermediate or Advanced, then one payment through Paystack (${ngn} in Nigeria, ${usd} elsewhere). You get the workspace for the path and level you choose, then a short career assessment.`,
    ],
    [
      formatWhen(new Date(c1.startsAt)),
      `${c1.name} starts`,
      "Your personalized plan, your Notion workspace for the path and level you chose, and the founding cohort.",
    ],
  ];

  const faqs: [string, string][] = [
    [
      "Who is Veerly for?",
      "Anyone pursuing remote work or growing a remote career, in any remote-friendly field: first remote job, moving into remote work, career changers, freelancers moving into full-time roles, graduates and experienced professionals. You don't need to work in tech or sales.",
    ],
    [
      "How do you use my email and WhatsApp number?",
      "Only in the ways you tick. Email consent covers launch updates and occasional marketing emails, and every email has an unsubscribe link. WhatsApp consent means we'll message you when Veerly enrolment opens; reply STOP at any time to opt out. We never sell your details.",
    ],
    [
      "How much does it cost, and how do I pay?",
      usdEnabled
        ? `The founding cohort is a one-time payment of ${ngn} in Nigeria or ${usd} elsewhere, and this page can show the price in your own currency for reference. There's no subscription. When enrolment opens you'll pay through Paystack's secure checkout: in naira if you choose NGN, otherwise in US dollars, and your bank converts it if your card uses another currency. Joining the waitlist is free.`
        : `The founding cohort is a one-time payment of ${ngn} (about ${usd}), and this page can show the price in your own currency for reference. There's no subscription. When enrolment opens you'll pay ${ngn} in naira through Paystack's secure checkout; if your card uses another currency, your bank converts it. Joining the waitlist is free.`,
    ],
    [
      "How is my workspace delivered?",
      "You get one Notion workspace for the career path and level you choose — Beginner, Intermediate or Advanced — and only that one, not every version. Job Hunt OS, Portfolio Builder and Interview Preparation System are all inside it. Notion has a free plan, and the workspace is set up for you, so you mainly fill things in and tick things off. You'll get access instructions right after payment.",
    ],
    [
      "What's the difference between Beginner, Intermediate and Advanced?",
      "Every career path has three levels. Beginner starts from zero and assumes very little. Intermediate is for people who already know the basics of that path and want to run systems, not just single tasks. Advanced is for people who already do the work and want to specialise, lead or design how the work is done. Each path and level has its own workspace, and you only receive the one you choose. The price is the same for every path and level.",
    ],
    [
      "When does the cohort start?",
      `${c1.name} starts on ${formatWhen(new Date(c1.startsAt))}. Founding enrolment and payment open on ${label}. Until then, joining the waitlist is free and there's nothing to pay. Later cohorts follow; this page always shows when the next one starts.`,
    ],
    [
      "Will Veerly get me a job?",
      "No one can honestly promise that, and we won't. Veerly helps you get organised, build proof of your skills and prepare properly. Hiring decisions are made by employers, and results depend on your effort, your field and the job market.",
    ],
    [
      "What happens after the cohort ends?",
      "You keep the Notion resources you purchased. Access to community and live support follows the cohort policy, which we'll share before enrolment.",
    ],
  ];

  return (
    <CurrencyProvider
      initial={initialCurrency}
      country={country}
      usdEnabled={usdEnabled}
    >
      <LaunchProvider
        promoAtIso={promoAt().toISOString()}
        enrolAtIso={enrol.toISOString()}
        cohorts={cohorts()}
        label={label}
        shortLabel={shortLabel}
        initialPhase={phase}
        forced={forced}
        serverNow={now}
      >
        <LevelProvider>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <EnrolBanner />
        <Nav tone="stage" cta={<NavCta />} />
        <Motion>
          <main id="main">
            {/* ───── Stage ───── */}
            <section
              aria-labelledby="hero-title"
              className="relative bg-stage [background-image:radial-gradient(80%_60%_at_10%_-10%,rgb(255_255_255/0.12),transparent_60%),radial-gradient(60%_50%_at_100%_110%,color-mix(in_oklab,var(--stage-deep)_55%,transparent),transparent_70%)]"
            >
              <div className="wrap flex flex-col pt-16 sm:pt-20 lg:min-h-[min(calc(100svh-8rem),820px)] lg:pt-24">
                <h1
                  id="hero-title"
                  className="display text-[clamp(44px,7vw,96px)] leading-[0.98] text-white"
                >
                  <span data-enter="line" className="block">
                    Your career. Your goals.
                  </span>
                  <span data-enter="line" className="block text-white/70">
                    Your personalized path.
                  </span>
                </h1>

                <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:items-end lg:gap-8">
                  <div className="flex flex-col gap-8 lg:col-span-6 lg:pb-1">
                    <p
                      data-enter="fade"
                      className="max-w-[46ch] text-lg leading-relaxed text-white sm:text-[19px]"
                    >
                      A personalized operating system for building, navigating
                      and growing your remote career, whatever field
                      you&rsquo;re in.
                    </p>
                    <div
                      data-enter="fade"
                      className="flex flex-col gap-3 sm:flex-row sm:items-center"
                    >
                      <LaunchCta
                        variant="yellow"
                        size="lg"
                        arrow
                        className="w-full sm:w-auto"
                      />
                      <a
                        href="#systems"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/20 px-5 text-[15px] font-medium text-white no-underline transition-colors hover:border-white/40 hover:bg-white/5 sm:border-transparent sm:px-4"
                      >
                        See what&rsquo;s inside{" "}
                        <IconArrowDown className="size-4" aria-hidden="true" />
                      </a>
                    </div>
                    <div data-enter="fade" className="flex flex-col gap-2">
                      <p className="tnum flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/95">
                        <CurrencySelect tone="stage" />
                        <span>
                          <Price className="font-medium text-white" /> one-time
                          · founding cohort · no subscription
                        </span>
                      </p>
                      <CheckoutNote className="max-w-[52ch] text-white/95" />
                    </div>
                  </div>
                  <div className="lg:col-span-5 lg:col-start-8">
                    <Countdown cohortDay={`${c1.name} starts ${c1Day}`} />
                  </div>
                </div>

                {/* Contents strip: hands the stage over to the numbered systems below. */}
                <nav
                  aria-label="What you get"
                  data-enter="fade"
                  className="mt-20 grid border-t border-white/15 sm:grid-cols-3 lg:mt-auto lg:pt-0"
                >
                  {systems.map((sys) => (
                    <a
                      key={sys.id}
                      href={`#${sys.id}`}
                      className="group flex items-baseline gap-4 border-b border-white/15 py-5 no-underline sm:border-b-0 sm:py-7 sm:pr-6 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:pl-6"
                    >
                      <span className="tnum font-display text-sm font-bold text-white">
                        {sys.n}
                      </span>
                      <span className="flex flex-1 items-center justify-between gap-3 text-[15px] font-medium text-white">
                        {sys.name}
                        <IconArrowDown
                          className="size-4 shrink-0 text-white/80 transition-transform group-hover:translate-y-0.5 group-hover:text-white"
                          aria-hidden="true"
                        />
                      </span>
                    </a>
                  ))}
                </nav>
              </div>
            </section>
            <div id="stage-end" aria-hidden="true" />

            {/* ───── Systems ───── */}
            <section
              id="systems"
              aria-labelledby="systems-title"
              className="py-24 sm:py-32"
            >
              <div className="wrap flex flex-col gap-16">
                <div className="grid gap-8 lg:grid-cols-12">
                  <h2 id="systems-title" className="h2 lg:col-span-7">
                    Three connected systems.{" "}
                    <span className="quiet">
                      One Notion workspace for your path and level.
                    </span>
                  </h2>
                  <p className="max-w-[44ch] text-lg leading-relaxed text-ink-2 lg:col-span-4 lg:col-start-9 lg:pt-2">
                    All three sit inside the one workspace you get, set up for
                    you, so you mainly fill things in and tick things off. Each one follows the plan
                    from your onboarding assessment.
                  </p>
                </div>

                <ol className="border-b border-line">
                  {systems.map((sys) => (
                    <li
                      key={sys.id}
                      id={sys.id}
                      data-row
                      className="grid scroll-mt-24 gap-6 border-t border-line py-10 sm:py-14 lg:grid-cols-12 lg:gap-8"
                    >
                      <span
                        aria-hidden="true"
                        className="display tnum text-[clamp(56px,6vw,88px)] leading-[0.85] text-brand lg:col-span-2"
                      >
                        {sys.n}
                      </span>
                      <div className="flex flex-col gap-4 lg:col-span-5">
                        <h3 className="font-display text-[clamp(28px,2.8vw,40px)] leading-[1.05] font-bold tracking-[-0.025em] text-ink">
                          {sys.name}
                        </h3>
                        <p className="max-w-[40ch] text-lg leading-relaxed text-ink-2">
                          {sys.blurb}
                        </p>
                        <p className="max-w-[44ch] text-[15px] text-ink-3">
                          <span className="font-medium text-ink">
                            Personalized:{" "}
                          </span>
                          {sys.shaped}
                        </p>
                      </div>
                      <div className="lg:col-span-4 lg:col-start-9">
                        <p className="mb-1 text-[13px] font-medium text-ink-3">
                          What it includes
                        </p>
                        <ul className="flex flex-col">
                          {sys.points.map((pt) => (
                            <li
                              key={pt}
                              className="flex items-center gap-3 border-b border-line py-3.5 text-[16px] text-ink last:border-b-0"
                            >
                              <IconCheck
                                className="size-4 shrink-0 text-brand"
                                strokeWidth={2.25}
                                aria-hidden="true"
                              />
                              {pt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            <Workspace />

            {/* ───── Personalization ───── */}
            <section
              id="personalization"
              aria-labelledby="pers-title"
              className="border-t border-line bg-white py-24 sm:py-32"
            >
              <div className="wrap flex flex-col gap-16">
                <div className="grid gap-8 lg:grid-cols-12">
                  <h2 id="pers-title" className="h2 lg:col-span-6">
                    A plan that starts with you.{" "}
                    <span className="quiet">Not a generic checklist.</span>
                  </h2>
                  <p className="max-w-[52ch] text-lg leading-relaxed text-ink-2 lg:col-span-5 lg:col-start-8 lg:pt-2">
                    A customer success professional and a graphic designer
                    shouldn&rsquo;t get the same plan. Veerly begins with a
                    short onboarding assessment, and everything else follows
                    from it.
                  </p>
                </div>

                <ol className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
                  {personalization.map(([t, d], i) => (
                    <li
                      key={t}
                      className="flex flex-col gap-3 border-b border-line py-8 sm:px-8 sm:first:pl-0 sm:even:border-l lg:border-b-0 lg:border-l lg:first:border-l-0 lg:[&:nth-child(3)]:border-l"
                    >
                      <span className="tnum font-display text-sm font-bold text-brand">
                        Step {i + 1}
                      </span>
                      <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
                        {t}
                      </h3>
                      <p className="text-[15px] leading-relaxed text-ink-2">
                        {d}
                      </p>
                    </li>
                  ))}
                </ol>

                <figure className="overflow-hidden rounded-xl border border-line">
                  <figcaption className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line bg-ground px-6 py-4">
                    <span className="font-medium text-ink">
                      Same systems, different plans
                    </span>
                    <span className="text-[13px] text-ink-3">
                      Illustrative example
                    </span>
                  </figcaption>
                  <div className="divide-y divide-line md:hidden">
                    {(
                      [
                        "Customer success professional",
                        "Graphic designer",
                      ] as const
                    ).map((who, col) => (
                      <dl key={who} className="flex flex-col gap-4 px-5 py-6">
                        <dt className="font-semibold text-ink">{who}</dt>
                        {comparison.map(([k, a, b]) => (
                          <dd key={k} className="flex flex-col gap-0.5">
                            <span className="text-[13px] text-ink-3">{k}</span>
                            <span className="text-[15px] text-ink-2">
                              {col === 0 ? a : b}
                            </span>
                          </dd>
                        ))}
                      </dl>
                    ))}
                  </div>
                  <div className="hidden md:block">
                    <table className="w-full border-collapse text-left text-[15px]">
                      <thead>
                        <tr className="border-b border-line">
                          <th
                            scope="col"
                            className="w-[22%] px-6 py-4 font-medium text-ink-3"
                          >
                            <span className="sr-only">Plan element</span>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-4 font-semibold text-ink"
                          >
                            Customer success professional
                          </th>
                          <th
                            scope="col"
                            className="border-l border-line px-6 py-4 font-semibold text-ink"
                          >
                            Graphic designer
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparison.map(([k, a, b]) => (
                          <tr
                            key={k}
                            className="border-b border-line last:border-b-0"
                          >
                            <th
                              scope="row"
                              className="px-6 py-5 align-top font-medium text-ink-3"
                            >
                              {k}
                            </th>
                            <td className="px-6 py-5 align-top text-ink-2">
                              {a}
                            </td>
                            <td className="border-l border-line px-6 py-5 align-top text-ink-2">
                              {b}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </figure>
              </div>
            </section>

            {/* ───── Career paths ───── */}
            <section
              id="paths"
              aria-labelledby="paths-title"
              className="border-t border-line py-24 sm:py-32"
            >
              <div className="wrap flex flex-col gap-14">
                <div className="grid gap-8 lg:grid-cols-12">
                  <h2 id="paths-title" className="h2 lg:col-span-7">
                    Ten remote career paths.{" "}
                    <span className="quiet">
                      You don&rsquo;t need to work in tech.
                    </span>
                  </h2>
                  <p className="max-w-[44ch] text-lg leading-relaxed text-ink-2 lg:col-span-4 lg:col-start-9 lg:pt-2">
                    Every path has a Beginner, Intermediate and Advanced plan.
                    Choose your path and level when you join, and you only
                    receive the workspace for that combination.
                  </p>
                </div>
                <ul className="grid overflow-hidden rounded-xl border border-line bg-line [gap:1px] sm:grid-cols-2 lg:grid-cols-5">
                  {paths.map(([p, roles]) => (
                    <li
                      key={p}
                      className="flex flex-col justify-between gap-2 bg-white p-5 sm:p-6 lg:min-h-[140px] lg:gap-6 transition-colors hover:bg-ground"
                    >
                      <span className="text-[16px] leading-snug font-semibold tracking-[-0.01em] text-ink">
                        {p}
                      </span>
                      <span className="text-[13px] leading-snug text-ink-3">
                        {roles}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="-mt-8 text-[13px] text-ink-3">
                  Example roles for each path. Veerly doesn&rsquo;t place you in
                  a job.
                </p>
              </div>
            </section>

            <LevelChoice cohortWindow={c1Window} />

            {/* ───── Join ───── */}
            <section
              id="join"
              aria-labelledby="join-title"
              className="border-t border-line bg-white py-24 sm:py-32"
            >
              <div className="wrap grid gap-16 lg:grid-cols-12 lg:gap-8">
                <div className="flex flex-col gap-12 lg:col-span-5">
                  <JoinHeading />
                  <ol className="relative flex flex-col gap-9" data-rail-wrap>
                    <span
                      aria-hidden="true"
                      className="absolute top-2 bottom-2 left-[5px] w-px bg-line"
                    />
                    <span
                      aria-hidden="true"
                      data-rail
                      className="absolute top-2 bottom-2 left-[5px] w-px bg-brand"
                    />
                    {timeline.map(([when, title, body], i) => (
                      <li
                        key={title}
                        className="relative grid grid-cols-[11px_1fr] gap-x-5"
                      >
                        <span
                          aria-hidden="true"
                          className={
                            i === 0
                              ? "mt-1.5 size-[11px] rounded-full bg-brand"
                              : "mt-1.5 size-[11px] rounded-full border border-brand/50 bg-white"
                          }
                        />
                        <div className="flex flex-col gap-1">
                          <span className="tnum text-[13px] font-medium text-brand">
                            {when}
                          </span>
                          <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
                            {title}
                          </h3>
                          <p className="text-[15px] leading-relaxed text-ink-2">
                            {body}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="lg:sticky lg:top-24 lg:col-span-6 lg:col-start-7 lg:self-start">
                  <SignupCard
                    paymentsEnabled={payments}
                    whatsappChannelUrl={site.whatsappChannelUrl || undefined}
                    cohortWindow={c1Window}
                  />
                </div>
              </div>
            </section>

            {/* ───── Pricing ───── */}
            <section
              id="pricing"
              aria-labelledby="pricing-title"
              className="bg-ink py-24 text-white sm:py-32"
            >
              <div className="wrap grid gap-16 lg:grid-cols-12 lg:gap-8">
                <div className="flex flex-col gap-10 lg:col-span-6">
                  <h2 id="pricing-title" className="h2 text-white">
                    One price.{" "}
                    <span className="text-white/45">Everything included.</span>
                  </h2>
                  <div className="flex flex-col gap-3">
                    <p className="display tnum text-[clamp(72px,10vw,128px)] leading-[0.9] text-white">
                      <Price />
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <CurrencySelect tone="dark" />
                      <p className="tnum text-[17px] text-white/75">
                        One-time. Per cohort. No subscription.
                      </p>
                    </div>
                    <CheckoutNote className="max-w-[48ch] text-white/75" />
                  </div>
                  <PricingCta paymentsEnabled={payments} />
                </div>
                <div className="flex flex-col gap-10 lg:col-span-5 lg:col-start-8">
                  <ul className="flex flex-col border-t border-white/12">
                    {included.map((i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 border-b border-white/12 py-4 text-[16px] text-white/85"
                      >
                        <IconCheck
                          className="size-4 shrink-0 text-tint"
                          strokeWidth={2.25}
                          aria-hidden="true"
                        />
                        {i}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-3">
                    <Countdown
                      variant="strip"
                      withHeading
                      className="max-w-[360px]"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ───── FAQ ───── */}
            <section
              id="faq"
              aria-labelledby="faq-title"
              className="py-24 sm:py-32"
            >
              <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-8">
                <div className="flex flex-col gap-4 lg:col-span-4">
                  <h2 id="faq-title" className="h2">
                    Questions, <span className="quiet">answered honestly.</span>
                  </h2>
                </div>
                <Accordion
                  type="single"
                  collapsible
                  className="border-t border-line lg:col-span-7 lg:col-start-6"
                >
                  {faqs.map(([q, a]) => (
                    <AccordionItem
                      key={q}
                      value={q}
                      className="border-b border-line"
                    >
                      <AccordionTrigger className="gap-6 py-5 text-[17px] font-medium text-ink hover:no-underline">
                        {q}
                      </AccordionTrigger>
                      <AccordionContent className="max-w-[62ch] pb-6 text-[15px] leading-relaxed text-ink-2">
                        {a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>
          </main>
        </Motion>
        <Footer />
        </LevelProvider>
      </LaunchProvider>
    </CurrencyProvider>
  );
}
