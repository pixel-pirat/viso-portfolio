import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/SectionHeader";
import CTASection from "@/components/CTASection";
import { services, projects, posts } from "@/data/site";
import heroTech from "@/assets/hero-tech.jpg";

const Home = () => {
  const featuredProjects = projects.slice(0, 4);
  const featuredPosts = posts.slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

        <div className="container-studio relative pt-20 pb-28 md:pt-28 md:pb-40 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 backdrop-blur px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles size={14} className="text-primary" />
              Now booking Q3 projects
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-[0.95]">
              <span className="text-gradient">We design</span>
              <br />
              <span className="text-gradient-brand">digital experiences</span>
              <br />
              <span className="text-gradient">that perform.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              A modern creative studio building websites, apps, and brands for ambitious teams.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild variant="hero" size="lg">
                <Link to="/contact">
                  Start a Project <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/projects">View Work</Link>
              </Button>
            </div>
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
            { v: "60+", l: "Projects shipped" },
            { v: "12", l: "Industries" },
            { v: "4.9★", l: "Avg. rating" },
            { v: "8 yrs", l: "In the craft" },
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
            <Link to="/projects">
              All projects <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {featuredProjects.map((p, i) => (
            <Link
              key={p.slug}
              to={`/projects/${p.slug}`}
              className="group surface-card p-8 block"
            >
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
          {services.map((s) => (
            <Link
              key={s.slug}
              to={`/services/${s.slug}`}
              className="group surface-card p-6 block"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-secondary border border-border text-primary group-hover:bg-gradient-primary group-hover:text-primary-foreground group-hover:border-transparent transition-all">
                <s.icon size={20} />
              </div>
              <h3 className="font-display text-lg font-semibold mt-5">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{s.short}</p>
              <div className="mt-5 inline-flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="container-studio py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-purple animate-glow-pulse" />
            About the studio
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-gradient">
            A small team. Senior craft. No fluff.
          </h2>
          <p className="text-lg text-muted-foreground">
            We're a focused team of designers and engineers who care equally about how something looks and how
            it performs. Every project gets senior attention from start to ship.
          </p>
          <Button asChild variant="outline">
            <Link to="/about">
              More about us <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {["Strategy", "Design", "Engineering", "Launch"].map((t, i) => (
            <div
              key={t}
              className="surface-card p-6 aspect-square flex flex-col justify-between"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="text-xs text-muted-foreground">0{i + 1}</span>
              <span className="font-display text-2xl font-semibold">{t}</span>
            </div>
          ))}
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
            <Link to="/blog">
              All posts <ArrowRight />
            </Link>
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
