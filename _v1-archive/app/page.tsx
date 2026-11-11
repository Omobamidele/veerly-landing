import Image from "next/image";
import WaitlistForm from "@/components/WaitlistForm";
import Reveal from "@/components/Reveal";
import { careerPaths, site } from "@/lib/site";

const nav = [
  { href: "#systems", label: "The systems" },
  { href: "#personalization", label: "Personalization" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#paths", label: "Career paths" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const assessmentInputs = [
  "Your current profession or career interest",
  "Your skills and experience",
  "Your preferred remote career path",
  "Your career stage",
  "The roles you're targeting",
  "Your career goals",
];

const planOutputs = [
  ["Skills to develop", "What to learn next, and what you can already lean on."],
  ["Roles to pursue", "Remote roles that fit where you are and where you want to go."],
  ["Companies to target", "A focused list instead of a thousand open tabs."],
  ["Projects to build", "Portfolio work that proves the skills your target roles ask for."],
  ["How to present your experience", "Turn what you've already done into a story employers understand."],
  ["How to job-search", "A weekly rhythm for finding, applying and following up."],
  ["How to prepare for interviews", "Questions, exercises and practice for your role, not someone else's."],
];

const systems = [
  {
    key: "A",
    name: "Veerly Job Hunt OS",
    blurb: "One organised place to find and pursue remote opportunities, instead of spreadsheets, bookmarks and memory.",
    items: [
      "Remote job application tracker",
      "Company and opportunity database",
      "Job discovery resources",
      "Networking and recruiter CRM",
      "Application follow-up tracker",
      "Weekly job-search planner",
      "Target-company list",
    ],
  },
  {
    key: "B",
    name: "Veerly Portfolio Builder",
    blurb: "Show what you can do, whatever your field. Build work that employers can see, not just claims on a CV.",
    items: [
      "Personalized portfolio structure",
      "Practical project templates",
      "Project documentation guides",
      "Skills demonstration exercises",
      "Portfolio progress tracker",
      "Guidance on presenting your work to employers",
    ],
  },
  {
    key: "C",
    name: "Veerly Interview Preparation System",
    blurb: "Walk into interviews and assessments prepared, with practice built around the role you actually want.",
    items: [
      "Role-specific interview preparation",
      "Common interview questions",
      "Practical interview exercises",
      "Mock interview preparation",
      "Communication and presentation exercises",
      "Interview tracking and feedback",
    ],
  },
];

const steps = [
  ["Complete your career assessment", "A short onboarding that captures your background, skills, preferred path and goals."],
  ["Receive your personalized career plan", "Your skills, roles, target companies, projects and job-search approach, shaped around you."],
  ["Access your three Notion systems", "Job Hunt OS, Portfolio Builder and Interview Preparation, connected and ready to use."],
  ["Complete guided activities", "Weekly activities and milestones with your cohort, so momentum doesn't depend on willpower alone."],
  ["Build your portfolio", "Practical projects that demonstrate what you can do in your chosen field."],
  ["Prepare for opportunities", "Practise for interviews and assessments, and track every conversation."],
];

const included = [
  "Veerly Job Hunt OS",
  "Veerly Portfolio Builder",
  "Veerly Interview Preparation System",
  "Your personalized career plan",
  "Cohort activities and resources",
  "Keep your Notion resources after the cohort ends",
];

const faqs: [string, React.ReactNode][] = [
  [
    "Who is Veerly for?",
    "Anyone pursuing remote work or growing a remote career: people looking for their first remote job, professionals moving into remote work, remote workers looking for better opportunities, freelancers moving into full-time remote roles, career changers, graduates, and experienced professionals looking for international opportunities. You don't need to work in tech or sales.",
  ],
  [
    "How is it personalized?",
    "You start with a short career assessment about your current profession or interest, your skills and experience, your preferred remote path, your career stage, your target roles and your goals. Your plan, activities and resources are then shaped around those answers. A customer success professional and a graphic designer won't receive the same plan.",
  ],
  [
    "Do I need Notion? Is it hard to use?",
    "Your three systems are delivered as Notion workspaces. Notion has a free plan, and the systems are set up for you, so you mainly fill things in and tick things off. If you're new to Notion, the guided activities will help you get comfortable.",
  ],
  [
    "When does the cohort start?",
    "The waitlist is open now, and we start sharing more in the first week of December 2026. The first cohort is planned for January 2027. Exact dates will be confirmed to everyone on the waitlist before enrolment opens.",
  ],
  [
    "How much does it cost, and is it a subscription?",
    "The founding cohort is a one-time payment of $7.99 (approximately ₦10,000). There is no recurring fee. Joining the waitlist is free and doesn't commit you to anything.",
  ],
  [
    "Will Veerly get me a job?",
    "No one can honestly promise that, and we won't. Veerly helps you get organised, build proof of your skills, and prepare properly for applications and interviews. Hiring decisions are made by employers, and results depend on your effort, your field and the job market.",
  ],
  [
    "What happens after the cohort ends?",
    "You keep the Notion resources you purchased. Access to community and live support follows the cohort policy, which we'll share with you before enrolment.",
  ],
];

function Check({ tone = "green" }: { tone?: "green" | "violet" }) {
  return (
    <svg className={`check check-${tone}`} viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
      <circle cx="10" cy="10" r="10" />
      <path d="M5.8 10.4l2.7 2.7 5.7-6" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Screen({ src, alt, caption, priority = false }: { src: string; alt: string; caption: string; priority?: boolean }) {
  return (
    <figure className="screen">
      <div className="screen-frame">
        <div className="screen-bar" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <Image src={src} alt={alt} width={1440} height={900} sizes="(max-width: 900px) 100vw, 640px" priority={priority} />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Reveal />
      <header className="site-header">
        <div className="wrap header-inner">
          <a href="#top" className="brand" aria-label="Veerly home">
            <Image src="/brand/veerly-logo-white.svg" alt="VEERLY" width={124} height={25} priority />
          </a>
          <nav aria-label="Main" className="main-nav">
            <ul>
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href}>{n.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <a href="#waitlist" className="btn btn-primary btn-sm">
            Join the waitlist
          </a>
        </div>
      </header>

      <main id="main">
        {/* HERO */}
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="polka polka-hero" aria-hidden="true" />
          <span className="accent-dot ad-1" aria-hidden="true" />
          <span className="accent-dot ad-2" aria-hidden="true" />
          <span className="accent-dot ad-3" aria-hidden="true" />
          <div className="wrap hero-grid">
            <div className="hero-copy" data-reveal>
              <p className="open-pill">
                <span className="open-pill-dot" aria-hidden="true" /> Open to every remote career path
              </p>
              <p className="hero-kicker">Veerly Remote Career Accelerator · Founding cohort</p>
              <h1 id="hero-title" className="display">
                Your career. Your goals. <span className="hl">Your personalized path.</span>
              </h1>
              <p className="lede">
                A personalized operating system for building, navigating and growing your remote career. Not another job
                tracker. A plan built around who you are and where you want to go.
              </p>
              <div className="hero-ctas">
                <a href="#waitlist" className="btn btn-primary btn-on-stage btn-lg">
                  Join the waitlist
                </a>
                <a href="#how-it-works" className="btn btn-ghost-light btn-lg">
                  See how it works
                </a>
              </div>
              <ul className="hero-meta" aria-label="Founding offer">
                <li>
                  <strong>$7.99</strong> one-time (≈ ₦10,000)
                </li>
                <li>Three Notion systems included</li>
                <li>First cohort planned for January 2027</li>
              </ul>
            </div>
            <div className="hero-visual" data-reveal>
              <Screen
                src="/brand/screens/applications.jpg"
                alt="Veerly applications board with roles organised into Saved, Applied, Interviewing and Offer columns, each showing the next step"
                caption="Applications, from saved to offer. Sample data shown."
                priority
              />
              <div className="float-card float-new" aria-hidden="true">
                <span className="new-badge">New</span>
                <span>Your weekly job-search plan is ready</span>
              </div>
              <div className="float-card float-dot" aria-hidden="true">
                <Image src="/brand/dot.svg" alt="" width={48} height={48} />
                <span>
                  <strong>Your plan adapts</strong>
                  to your path, skills and goals
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section className="band band-lilac" aria-labelledby="problem-title">
          <div className="wrap">
            <div className="problem" data-reveal>
              <h2 id="problem-title" className="display h2">
                Remote career advice is everywhere. A plan for <em>you</em> is not.
              </h2>
              <div className="problem-grid">
                <div>
                  <h3>Scattered searches</h3>
                  <p>Applications live in tabs, inboxes and half-finished spreadsheets, so follow-ups slip and good roles get lost.</p>
                </div>
                <div>
                  <h3>One-size-fits-all advice</h3>
                  <p>Most guidance assumes everyone is chasing the same job. Your background, skills and goals are not the same as everyone else's.</p>
                </div>
                <div>
                  <h3>Nothing to show</h3>
                  <p>Remote employers want proof of what you can do. It's hard to know which projects to build, or how to present them.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PERSONALIZATION */}
        <section className="section" id="personalization" aria-labelledby="pers-title">
          <div className="wrap">
            <header className="section-head" data-reveal>
              <p className="kicker">The difference</p>
              <h2 id="pers-title" className="display h2">
                Not a template. A plan that starts with you.
              </h2>
              <p className="section-lede">
                Veerly begins with a short onboarding assessment. Your answers shape what you work on, what you build and
                how you search, so the systems stay connected while your plan stays yours.
              </p>
            </header>
            <div className="pers-grid">
              <div className="pers-card pers-in" data-reveal>
                <h3>You tell us</h3>
                <ul className="plain-list">
                  {assessmentInputs.map((i) => (
                    <li key={i}>
                      <Check tone="violet" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pers-arrow" aria-hidden="true">
                <svg viewBox="0 0 48 48" width="48" height="48">
                  <path d="M10 24h26M28 15l9 9-9 9" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="pers-card pers-out" data-reveal>
                <h3>Your plan helps you decide</h3>
                <ol className="out-list">
                  {planOutputs.map(([t, d]) => (
                    <li key={t}>
                      <strong>{t}</strong>
                      <span>{d}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="compare" data-reveal>
              <p className="compare-label">Same systems, different plans. An illustrative example:</p>
              <div className="compare-grid">
                <div className="compare-card">
                  <p className="compare-who">Customer success professional</p>
                  <ul>
                    <li>Targets remote customer success and account management roles</li>
                    <li>Builds a project around onboarding and retaining customers</li>
                    <li>Practises scenario questions about difficult customer conversations</li>
                  </ul>
                </div>
                <div className="compare-card">
                  <p className="compare-who">Graphic designer</p>
                  <ul>
                    <li>Targets remote design and creative services roles</li>
                    <li>Builds case studies that explain the thinking behind the work</li>
                    <li>Practises presenting a portfolio and taking feedback live</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SYSTEMS */}
        <section className="section section-lilac" id="systems" aria-labelledby="systems-title">
          <div className="wrap">
            <header className="section-head" data-reveal>
              <p className="kicker">Three integrated systems, one purchase</p>
              <h2 id="systems-title" className="display h2">
                Everything your remote job search needs, working together.
              </h2>
            </header>

            <div className="system-row" data-reveal>
              <div className="system-copy">
                <p className="system-key">System A</p>
                <h3 className="display h3">{systems[0].name}</h3>
                <p>{systems[0].blurb}</p>
                <ul className="feature-list">
                  {systems[0].items.map((i) => (
                    <li key={i}>
                      <Check />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
              <Screen
                src="/brand/screens/jobs.jpg"
                alt="Veerly jobs table listing remote roles with company, location, salary, date posted and your status"
                caption="Job discovery with your status on each role. Sample data shown."
              />
            </div>

            <div className="system-row system-row-flip" data-reveal>
              <div className="system-copy">
                <p className="system-key">System B</p>
                <h3 className="display h3">{systems[1].name}</h3>
                <p>{systems[1].blurb}</p>
                <ul className="feature-list">
                  {systems[1].items.map((i) => (
                    <li key={i}>
                      <Check />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
              <Screen
                src="/brand/screens/work.jpg"
                alt="Veerly 'My work' tracker grouping projects as In progress, Submitted and Completed, with progress for each"
                caption="Track every project from in progress to completed. Sample data shown."
              />
            </div>

            <div className="system-row" data-reveal>
              <div className="system-copy">
                <p className="system-key">System C</p>
                <h3 className="display h3">{systems[2].name}</h3>
                <p>{systems[2].blurb}</p>
                <ul className="feature-list">
                  {systems[2].items.map((i) => (
                    <li key={i}>
                      <Check />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="app-mock" aria-label="Illustration of an interview preparation checklist" role="img">
                <div className="app-mock-head">
                  <span>Interview prep</span>
                  <span className="app-chip">Your target role</span>
                </div>
                <ul>
                  <li className="done">
                    <Check /> Tell me about yourself, in two minutes
                  </li>
                  <li className="done">
                    <Check /> Walk through one project from your portfolio
                  </li>
                  <li>
                    <span className="todo" /> Practical exercise for your role
                  </li>
                  <li>
                    <span className="todo" /> Mock interview and feedback notes
                  </li>
                </ul>
                <div className="app-mock-progress">
                  <span className="bar">
                    <span style={{ width: "50%" }} />
                  </span>
                  <span>2 of 4 ready</span>
                </div>
                <p className="mock-note">Illustration</p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section" id="how-it-works" aria-labelledby="how-title">
          <div className="wrap">
            <header className="section-head how-head" data-reveal>
              <div>
                <p className="kicker">How it works</p>
                <h2 id="how-title" className="display h2">
                  Six steps from &ldquo;where do I start?&rdquo; to ready.
                </h2>
              </div>
              <div className="dot-guide">
                <Image src="/brand/dot.svg" alt="Dot, Veerly's guide" width={88} height={88} />
                <p className="bubble">Hi, I&rsquo;m Dot. I&rsquo;ll be guiding you through each step.</p>
              </div>
            </header>
            <ol className="steps">
              {steps.map(([t, d], i) => (
                <li key={t} data-reveal>
                  <span className="step-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </li>
              ))}
            </ol>
            <div className="portfolio-peek" data-reveal>
              <div>
                <p className="kicker">Build proof, not just a CV</p>
                <h3 className="display h3">Practical projects you can show an employer.</h3>
                <p>
                  Your Portfolio Builder suggests projects that match your path. Pick one, follow the guide, document what
                  you did, and track it through to done.
                </p>
              </div>
              <Screen
                src="/brand/screens/projects.jpg"
                alt="Veerly projects page showing your projects with In progress, Submitted and Completed statuses, and practical challenges to browse by level and area"
                caption="Projects and practical challenges. Sample data shown."
              />
            </div>
          </div>
        </section>

        {/* CAREER PATHS */}
        <section className="band band-stage" id="paths" aria-labelledby="paths-title">
          <div className="polka polka-band" aria-hidden="true" />
          <div className="wrap paths">
            <header className="section-head" data-reveal>
              <p className="kicker kicker-light">Career paths</p>
              <h2 id="paths-title" className="display h2">
                Built for remote careers in many fields.
              </h2>
              <p className="section-lede">
                Choose the path that fits you. Your plan, projects and interview practice are personalized to it.
              </p>
            </header>
            <ul className="path-grid" data-reveal>
              {careerPaths.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="paths-note" data-reveal>
              Not sure which path fits yet? The assessment helps you see which roles match your skills and goals.
            </p>
          </div>
        </section>

        {/* PRICING */}
        <section className="section" id="pricing" aria-labelledby="pricing-title">
          <div className="wrap pricing">
            <header className="section-head" data-reveal>
              <p className="kicker">Founding cohort pricing</p>
              <h2 id="pricing-title" className="display h2">
                One price. Everything included.
              </h2>
              <p className="section-lede">
                We kept the founding price low on purpose, so more people can get started wherever they are.
              </p>
            </header>
            <div className="price-wrap" data-reveal>
              <div className="price-card">
                <p className="price-name">Veerly Remote Career Accelerator</p>
                <p className="price">
                  <span className="amount">$7.99</span>
                  <span className="per">one-time · ≈ ₦10,000</span>
                </p>
                <p className="price-sub">One payment per cohort. No recurring fee.</p>
                <ul className="feature-list">
                  {included.map((i) => (
                    <li key={i}>
                      <Check />
                      {i}
                    </li>
                  ))}
                </ul>
                <a href="#waitlist" className="btn btn-primary btn-lg btn-block">
                  Join the waitlist
                </a>
                <p className="price-foot">Enrolment isn&rsquo;t open yet. Waitlist members hear first.</p>
              </div>
              <ol className="timeline" aria-label="Founding timeline">
                <li className="t-now">
                  <span className="t-when">Now</span>
                  <span className="t-what">Waitlist open</span>
                </li>
                <li>
                  <span className="t-when">First week of December 2026</span>
                  <span className="t-what">Veerly launches publicly, with demos and details</span>
                </li>
                <li>
                  <span className="t-when">January 2027</span>
                  <span className="t-what">First cohort planned</span>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* WAITLIST */}
        <section className="section section-lilac" id="waitlist" aria-labelledby="waitlist-title">
          <div className="wrap waitlist">
            <header className="waitlist-head" data-reveal>
              <p className="kicker">Join the waitlist</p>
              <h2 id="waitlist-title" className="display h2">
                Save your spot in the founding cohort.
              </h2>
              <p className="section-lede">
                Tell us a little about where you are. It helps us shape the first career paths and the onboarding
                assessment, and you&rsquo;ll be first to hear when enrolment opens.
              </p>
              <div className="callout">
                <p className="callout-title">Founding cohort</p>
                <p>
                  <strong>$7.99 one-time</strong> (≈ ₦10,000), everything included. First cohort planned for January
                  2027.
                </p>
              </div>
              <ul className="plain-list small">
                <li>
                  <Check tone="violet" /> Free to join, no payment now
                </li>
                <li>
                  <Check tone="violet" /> Takes under a minute
                </li>
              </ul>
            </header>
            <div className="form-card" data-reveal>
              <WaitlistForm />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" id="faq" aria-labelledby="faq-title">
          <div className="wrap faq">
            <header className="section-head" data-reveal>
              <p className="kicker">FAQ</p>
              <h2 id="faq-title" className="display h2">
                Good questions, honest answers.
              </h2>
            </header>
            <div className="faq-list" data-reveal>
              {faqs.map(([q, a]) => (
                <details key={q}>
                  <summary>
                    <span>{q}</span>
                    <span className="faq-icon" aria-hidden="true" />
                  </summary>
                  <div className="faq-body">
                    <p>{a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap footer-inner">
          <div className="footer-brand">
            <Image src="/brand/veerly-logo-white.svg" alt="VEERLY" width={140} height={28} />
            <p className="belief">{site.belief}</p>
          </div>
          <nav aria-label="Footer" className="footer-nav">
            <a href="#systems">The systems</a>
            <a href="#how-it-works">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <a href="#waitlist">Join the waitlist</a>
            {site.contactEmail ? <a href={`mailto:${site.contactEmail}`}>Contact</a> : null}
          </nav>
        </div>
        <div className="wrap footer-base">
          <p>© 2026 Veerly</p>
          <p>Veerly helps you prepare and get organised. It does not guarantee employment.</p>
        </div>
      </footer>
    </>
  );
}
