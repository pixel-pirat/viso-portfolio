import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import CTASection from "@/components/CTASection";
import { projects } from "@/data/site";
import { cn } from "@/lib/utils";

const categories = ["All", "Web", "Mobile", "Branding", "Media"] as const;

const Projects = () => {
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const filtered = filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <>
      <section className="container-studio pt-20 pb-12">
        <SectionHeader
          eyebrow="Projects"
          title="Selected work, end to end."
          description="A range of work across web, mobile, branding, and media — all built with the same care."
        />
      </section>

      <section className="container-studio pb-12">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                filter === c
                  ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="container-studio pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <Link
              key={p.slug}
              to={`/projects/${p.slug}`}
              className="group surface-card p-6 block animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="aspect-[4/3] mb-5 rounded-xl bg-gradient-to-br from-primary/20 via-secondary to-accent-purple/20 grid place-items-center relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-50" />
                <span className="relative font-display text-5xl font-bold text-gradient">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs uppercase tracking-widest text-primary">{p.category}</span>
                  <h3 className="font-display text-xl font-semibold mt-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{p.excerpt}</p>
                </div>
                <ArrowUpRight className="text-muted-foreground shrink-0 group-hover:text-primary group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" size={20} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <CTASection />
    </>
  );
};

export default Projects;
