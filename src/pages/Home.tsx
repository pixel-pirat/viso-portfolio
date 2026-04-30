import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Sparkles, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/SectionHeader";
import CTASection from "@/components/CTASection";
import { useStudio } from "@/store/StudioStore";
import { getIcon } from "@/lib/icons";
import heroTech from "@/assets/hero-3d-studio.jpg";

const timeAgo = (iso: string) => {
  const diff = Date.now() - +new Date(iso);
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const Home = () => {
  const { state } = useStudio();
  const slides = state.hero.slides;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  const current = slides[idx] ?? slides[0];
  const featuredProjects = (state.projects.filter((p) => p.isFeatured).length
    ? state.projects.filter((p) => p.isFeatured)
    : state.projects
  ).slice(0, 4);
  const featuredPosts = state.posts.filter((p) => p.isPublished).slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

        <div className="container-studio relative pt-20 pb-28 md:pt-28 md:pb-40 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in" key={current?.id}>
            {current?.eyebrow && (
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 backdrop-blur px-4 py-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles size={14} className="text-primary" />
                {current.eyebrow}
              </span>
            )}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-[0.95]">
              <span className="text-gradient-brand">{current?.title}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              {current?.subtitle}
            </p>
            <div className="flex flex-wrap gap-3 pt-2 items-center">
              <Button asChild variant="hero" size="lg">
                <Link to={current?.ctaHref ?? "/contact"}>
                  {current?.ctaLabel ?? "Start a Project"} <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/projects">View Work</Link>
              </Button>
              {slides.length > 1 && (
                <div className="flex gap-1.5 ml-2">
                  {slides.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => setIdx(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-primary" : "w-1.5 bg-border"}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Activity ticker */}
            {state.hero.activity.length > 0 && (
              <div className="surface-card p-4 max-w-xl">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  <Activity size={12} className="text-primary" /> Live from the studio
                </div>
                <ul className="space-y-1.5">
                  {state.hero.activity.slice(0, 3).map((a) => (
                    <li key={a.id} className="text-sm flex items-center justify-between gap-3">
                      <span className="truncate">{a.text}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{timeAgo(a.timestamp)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="relative animate-scale-in">
            <div className="absolute -inset-8 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
            <div className="relative rounded-3xl overflow-hidden border border-border shadow-elegant animate-float">
              <img
                src={heroTech}
                alt="Floating tech UI elements representing modern digital craftsmanship"
                width={1536}
                height={1280}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="container-studio">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {[
            { v: `${state.projects.length}+`, l: "Projects shipped" },
            { v: `${state.services.length}`, l: "Services" },
            { v: "4.9★", l: "Avg. rating" },
            { v: `${state.settings.developer.yearsExperience} yrs`, l: "In the craft" },
          ].map((s) => (
            <div key={s.l} className="bg-card p-6 text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-gradient-brand">{s.v}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="container-studio py-24">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <SectionHeader
            eyebrow="Selected Work"
            title="Recent projects"
            description="A look at some of the products and brands we've shipped lately."
          />
          <Button asChild variant="ghost" size="sm">
            <Link to="/projects">All projects <ArrowRight /></Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {featuredProjects.map((p, i) => (
            <Link key={p.slug} to={`/projects/${p.slug}`} className="group surface-card p-8 block">
              <div className="aspect-[16/10] mb-6 rounded-xl bg-gradient-to-br from-primary/20 via-secondary to-accent-purple/20 grid place-items-center relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-50" />
                <span className="relative font-display text-6xl font-bold text-gradient">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-primary">{p.category}</span>
                  <h3 className="text-2xl font-display font-semibold mt-1">{p.title}</h3>
                  <p className="text-muted-foreground mt-2">{p.excerpt}</p>
                </div>
                <ArrowUpRight className="text-muted-foreground group-hover:text-primary group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="container-studio py-24">
        <SectionHeader
          eyebrow="What we do"
          title="Services built around outcomes"
          description="From identity to launch, we cover the full stack of building modern digital products."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {state.services.map((s) => {
            const Icon = getIcon(s.icon);
            return (
              <Link key={s.slug} to={`/services/${s.slug}`} className="group surface-card p-6 block">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-secondary border border-border text-primary group-hover:bg-gradient-primary group-hover:text-primary-foreground group-hover:border-transparent transition-all">
                  <Icon size={20} />
                </div>
                <h3 className="font-display text-lg font-semibold mt-5">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{s.short}</p>
                <div className="mt-5 inline-flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <section className="container-studio py-24">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <SectionHeader
            eyebrow="Journal"
            title="Notes from the studio"
            description="Thoughts on design, engineering, and building things that last."
          />
          <Button asChild variant="ghost" size="sm">
            <Link to="/blog">All posts <ArrowRight /></Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {featuredPosts.map((p) => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="group surface-card p-6 block">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="text-primary">{p.category}</span>
                <span>•</span>
                <span>{p.readTime}</span>
              </div>
              <h3 className="font-display text-xl font-semibold mt-4 group-hover:text-primary transition-colors">
                {p.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">{p.excerpt}</p>
              <div className="mt-6 text-xs text-muted-foreground">{p.date}</div>
            </Link>
          ))}
        </div>
      </section>

      <CTASection />
    </>
  );
};

export default Home;
