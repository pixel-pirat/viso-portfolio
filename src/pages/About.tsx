import SectionHeader from "@/components/SectionHeader";
import CTASection from "@/components/CTASection";
import { useSettings } from "@/lib/useData";
import { Loader2 } from "lucide-react";

const skills = [
  "React", "TypeScript", "Next.js", "Tailwind", "Node.js",
  "Figma", "After Effects", "Photoshop", "Swift", "Kotlin",
  "Supabase", "PostgreSQL", "Framer Motion", "Three.js",
];

const About = () => {
  const { data: settings, isLoading } = useSettings();

  if (isLoading || !settings) {
    return (
      <div className="min-h-[80vh] grid place-items-center bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const dev = settings.developer;

  return (
    <>
      <section className="container-studio pt-20 pb-12">
        <SectionHeader
          eyebrow="About"
          title="A studio built around craft and clarity."
          description="A small, senior team that takes on a handful of projects each quarter."
        />
      </section>

      {/* PROFILE */}
      <section className="container-studio py-16 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-5 text-lg text-muted-foreground leading-relaxed">
          <p className="text-foreground text-2xl font-display">
            Hi, I'm {dev.name} — {dev.title}.
          </p>
          <p>{dev.bio}</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-secondary border border-border">{dev.yearsExperience}+ years experience</span>
            <span className="px-3 py-1 rounded-full bg-secondary border border-border">📍 {dev.location}</span>
          </div>
        </div>
        <div className="surface-card p-8 self-start text-center">
          {dev.avatarUrl ? (
            <img src={dev.avatarUrl} alt={dev.name} className="w-28 h-28 rounded-full mx-auto object-cover border border-border" />
          ) : (
            <div className="w-28 h-28 rounded-full mx-auto bg-gradient-primary text-primary-foreground grid place-items-center font-display text-4xl font-bold shadow-glow">
              {dev.name.charAt(0)}
            </div>
          )}
          <div className="mt-4 font-display text-lg font-semibold">{dev.name}</div>
          <div className="text-sm text-muted-foreground">{dev.title}</div>
        </div>
      </section>

      {/* SKILLS */}
      <section className="container-studio py-16">
        <span className="text-xs uppercase tracking-widest text-primary">Skills & tools</span>
        <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mt-3 mb-8">Toolkit</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s} className="px-4 py-2 rounded-full bg-secondary border border-border text-sm hover:border-primary hover:text-primary transition-colors">{s}</span>
          ))}
        </div>
      </section>

      <CTASection title="Like the way we work?" description="Tell us about your project — we'd love to chat." />
    </>
  );
};

export default About;
