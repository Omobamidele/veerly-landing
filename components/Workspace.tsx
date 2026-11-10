import Image from "next/image";

/**
 * Real screenshots of the Virtual Assistant Career OS in Notion.
 * Sources: notion-shots/clean/, cropped (no top bar, no cut-off columns,
 * no Netlify badge). learning-path and home-schedule were not used.
 */

type Shot = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

const sizes = {
  full: "(min-width: 1264px) 1200px, calc(100vw - 40px)",
  seven: "(min-width: 1264px) 688px, (min-width: 1024px) 56vw, calc(100vw - 40px)",
  five: "(min-width: 1264px) 480px, (min-width: 1024px) 38vw, calc(100vw - 40px)",
  half: "(min-width: 1264px) 584px, (min-width: 640px) 46vw, calc(100vw - 40px)",
} as const;

const home: Shot = {
  src: "/product/home.webp",
  width: 840,
  height: 916,
  caption: "Your Virtual Assistant Career OS",
  alt: "Home of the Veerly Virtual Assistant Career OS in Notion, with a welcome note and three Start here steps.",
};

const board: Shot = {
  src: "/product/job-hunt-board.webp",
  width: 1186,
  height: 550,
  caption: "Your job hunt pipeline",
  alt: "Job Hunt applications pipeline in Notion, with Applied, Closed, Interviewing and Offer columns.",
};

const coach: Shot = {
  src: "/product/home-coach.webp",
  width: 784,
  height: 538,
  caption: "Cohort coach: one countdown for the whole cohort",
  alt: "Veerly cohort coach on the Virtual Assistant workspace, showing Cohort 1 starting Monday, 1 February 2027.",
};

const portfolio: Shot = {
  src: "/product/portfolio.webp",
  width: 840,
  height: 944,
  caption: "Portfolio builder with six guided projects",
  alt: "Portfolio Builder page in the Virtual Assistant Career OS, describing six guided projects for the cohort.",
};

const interview: Shot = {
  src: "/product/interview.webp",
  width: 840,
  height: 756,
  caption: "Interview and client call prep",
  alt: "Interview and Client Call Prep page, with a next-call card, a practice goal and a rate-range card.",
};

const resources: Shot = {
  src: "/product/resources.webp",
  width: 840,
  height: 696,
  caption: "Resource library: 31 study pages",
  alt: "Resources page in the Virtual Assistant Career OS. Each resource is its own study page; links were checked on 10 November 2026.",
};

const jobHunt: Shot = {
  src: "/product/job-hunt.webp",
  width: 840,
  height: 824,
  caption: "Job Hunt OS, in one place",
  alt: "Job Hunt OS page, with path, weekly goal and rate-range cards above the applications pipeline.",
};

function Frame({
  shot,
  sizes: imgSizes,
}: {
  shot: Shot;
  sizes: string;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-white">
      <figcaption className="border-b border-line bg-ground px-5 py-3.5 sm:px-6">
        <span className="text-[15px] font-medium text-ink">{shot.caption}</span>
      </figcaption>
      <Image
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        sizes={imgSizes}
        quality={85}
        className="h-auto w-full"
      />
    </figure>
  );
}

export default function Workspace() {
  return (
    <section
      id="workspace"
      aria-labelledby="workspace-title"
      className="border-t border-line bg-white py-24 sm:py-32"
    >
      <div className="wrap flex flex-col gap-14">
        <div className="grid gap-8 lg:grid-cols-12">
          <h2 id="workspace-title" className="h2 lg:col-span-7">
            Inside your Veerly workspace.{" "}
            <span className="quiet">The Virtual Assistant path.</span>
          </h2>
          <p className="max-w-[44ch] text-lg leading-relaxed text-ink-2 lg:col-span-4 lg:col-start-9 lg:pt-2">
            These are pages from the Virtual Assistant Career OS. The other nine
            paths follow the same system, shaped around that path.
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:gap-10">
          <div data-row>
            <Frame shot={home} sizes={sizes.full} />
          </div>

          <div
            data-row
            className="grid items-start gap-8 lg:grid-cols-12 lg:gap-8"
          >
            <div className="lg:col-span-7">
              <Frame shot={board} sizes={sizes.seven} />
            </div>
            <div className="lg:col-span-5">
              <Frame shot={coach} sizes={sizes.five} />
            </div>
          </div>

          <div data-row className="grid items-start gap-8 sm:grid-cols-2">
            <Frame shot={portfolio} sizes={sizes.half} />
            <Frame shot={interview} sizes={sizes.half} />
          </div>

          <div
            data-row
            className="grid items-start gap-8 lg:grid-cols-12 lg:gap-8"
          >
            <div className="lg:col-span-7">
              <Frame shot={resources} sizes={sizes.seven} />
            </div>
            <div className="lg:col-span-5">
              <Frame shot={jobHunt} sizes={sizes.five} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
