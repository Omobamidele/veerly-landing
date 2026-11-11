export const site = {
  name: "Veerly",
  title: "Veerly — Remote Career Accelerator",
  tagline: "Your career. Your goals. Your personalized path.",
  description:
    "A personalized operating system for building, navigating and growing your remote career. Join the waitlist for the Veerly Remote Career Accelerator founding cohort.",
  belief:
    "Access to better career opportunities should not be limited by where you live or what profession you started in.",
  // Placeholder until a domain is chosen. Set NEXT_PUBLIC_SITE_URL in production.
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3210",
  // Empty by default: the footer hides "Contact" until Mo sets a real address.
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
};

export const careerPaths = [
  "Sales and Business Development",
  "Marketing and Content",
  "Customer Success and Support",
  "Business Operations",
  "Administration and Virtual Assistance",
  "Project Management",
  "Data and Analytics",
  "Software and Technology",
  "GTM and Revenue Operations",
  "Design and Creative Services",
] as const;

export const careerStages = [
  "Student or recent graduate",
  "Early career (0–2 years)",
  "Mid-career (3–7 years)",
  "Experienced (8+ years)",
  "Changing careers",
  "Freelancer moving to full-time remote",
  "Already remote, looking to grow",
] as const;
