import SectionHeader from "@/components/SectionHeader";
import CTASection from "@/components/CTASection";

const skills = [
  "React", "TypeScript", "Next.js", "Tailwind", "Node.js",
  "Figma", "After Effects", "Photoshop", "Swift", "Kotlin",
  "Supabase", "PostgreSQL", "Framer Motion", "Three.js",
];

const journey = [
  { year: "2025", role: "Founder & Design Engineer", at: "This Studio" },
  { year: "2022", role: "Lead Product Designer", at: "Series B SaaS" },
  { year: "2020", role: "Senior Frontend Engineer", at: "Agency, Berlin" },
  { year: "2017", role: "Designer & Developer", at: "Freelance" },
];

const About = () => (
  <>
    <section className="container-studio pt-20 pb-12">
      <SectionHeader
        eyebrow="About"
        title="A studio built around craft and clarity."
        description="We're a small, senior team that takes on a handful of projects each quarter. Every engagement gets the attention it deserves."
      />
    </section>

    {/* INTRO */}
    <section className="container-studio py-16 grid lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-5 text-lg text-muted-foreground leading-relaxed">
        <p className="text-foreground text-2xl font-display">
          Hi, we're a creative studio working at the edge of design and engineering.
        </p>
        <p>
          We started with one belief: most digital work is either beautiful or functional, rarely both.
          We exist to close that gap — by combining the discipline of product engineering with the taste of
          a design studio.
        </p>
        <p>
          We work directly with founders, marketing leads, and product teams. No middle layer, no account
          managers — just the people doing the work.
        </p>
      </div>
      <div className="surface-card p-8 self-start">
        <div className="text-xs uppercase tracking-widest text-primary">Mission</div>
        <p className="mt-3 text-lg">
          To craft digital experiences that feel inevitable — clear, fast, and quietly delightful.
        </p>
      </div>
    </section>

    {/* SKILLS */}
    <section className="container-studio py-16">
      <span className="text-xs uppercase tracking-widest text-primary">Skills & tools</span>
      <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mt-3 mb-8">
        Our toolkit
      </h2>
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <span
            key={s}
            className="px-4 py-2 rounded-full bg-secondary border border-border text-sm hover:border-primary hover:text-primary transition-colors"
          >
            {s}
          </span>
        ))}
      </div>
    </section>

    {/* JOURNEY */}
    <section className="container-studio py-16">
      <span className="text-xs uppercase tracking-widest text-primary">Journey</span>
      <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mt-3 mb-8">
        Eight years in
      </h2>
      <div className="space-y-3">
        {journey.map((j) => (
          <div
            key={j.year}
            className="surface-card p-6 grid md:grid-cols-[100px_1fr_auto] gap-4 items-center"
          >
            <div className="font-display text-2xl text-gradient-brand">{j.year}</div>
            <div className="font-semibold">{j.role}</div>
            <div className="text-muted-foreground text-sm">{j.at}</div>
          </div>
        ))}
      </div>
    </section>

    <CTASection title="Like the way we work?" description="Tell us about your project — we'd love to chat." />
  </>
);

export default About;
