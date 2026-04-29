import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { useStudio } from "@/store/StudioStore";
import { cn } from "@/lib/utils";

const categories = ["All", "Design", "Engineering", "Branding", "Process"] as const;

const Blog = () => {
  const { state } = useStudio();
  const published = state.posts.filter((p) => p.isPublished);
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const filtered = filter === "All" ? published : published.filter((p) => p.category === filter);

  return (
    <>
      <section className="container-studio pt-20 pb-12">
        <SectionHeader
          eyebrow="Journal"
          title="Notes from the studio"
          description="Essays on design, engineering, and what it takes to ship work that lasts."
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
        <div className="grid gap-5">
          {filtered.map((p, i) => (
            <Link
              key={p.slug}
              to={`/blog/${p.slug}`}
              className="group surface-card p-8 block animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
                <div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="text-primary uppercase tracking-widest">{p.category}</span>
                    <span>•</span><span>{p.date}</span><span>•</span><span>{p.readTime}</span>
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-semibold mt-3 group-hover:text-primary transition-colors">
                    {p.title}
                  </h2>
                  <p className="text-muted-foreground mt-3 max-w-2xl">{p.excerpt}</p>
                </div>
                <ArrowUpRight className="text-muted-foreground group-hover:text-primary group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default Blog;
