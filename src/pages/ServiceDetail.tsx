import { Link, useParams } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import CTASection from "@/components/CTASection";
import { services } from "@/data/site";

const ServiceDetail = () => {
  const { slug } = useParams();
  const service = services.find((s) => s.slug === slug);

  if (!service) {
    return (
      <section className="container-studio py-32 text-center">
        <h1 className="text-4xl font-display font-bold">Service not found</h1>
        <Button asChild variant="hero" className="mt-6">
          <Link to="/services">Back to services</Link>
        </Button>
      </section>
    );
  }

  const Icon = service.icon;

  return (
    <>
      <section className="container-studio pt-20 pb-16">
        <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← All services
        </Link>
        <div className="mt-8 grid lg:grid-cols-[1fr_auto] gap-8 items-end">
          <div className="space-y-6 max-w-3xl">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
              <Icon size={28} />
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight text-gradient">
              {service.title}
            </h1>
            <p className="text-xl text-muted-foreground">{service.short}</p>
          </div>
          <Button asChild variant="hero" size="lg">
            <Link to="/contact">Start a Project <ArrowRight /></Link>
          </Button>
        </div>
      </section>

      {/* PROBLEMS */}
      <section className="container-studio py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <span className="text-xs uppercase tracking-widest text-primary">Problems we solve</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mt-3">
              Recognize any of these?
            </h2>
          </div>
          <ul className="space-y-3">
            {service.problems.map((p) => (
              <li key={p} className="surface-card p-5 flex gap-3 items-start">
                <span className="grid h-6 w-6 mt-0.5 place-items-center rounded-full bg-destructive/15 text-destructive text-xs">
                  ✕
                </span>
                <span className="text-foreground">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PROCESS */}
      <section className="container-studio py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-primary">Our process</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mt-3">
            How we deliver
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {service.process.map((step, i) => (
            <div key={step.step} className="surface-card p-6 relative">
              <div className="text-xs text-muted-foreground">Step 0{i + 1}</div>
              <h3 className="font-display text-xl font-semibold mt-3">{step.step}</h3>
              <p className="text-sm text-muted-foreground mt-2">{step.text}</p>
              <Check className="absolute top-6 right-6 text-primary" size={16} />
            </div>
          ))}
        </div>
      </section>

      {/* EXAMPLE GRID */}
      <section className="container-studio py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-primary">Example outputs</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mt-3">
            What you'll get
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/15 via-secondary to-accent-purple/15 border border-border grid place-items-center relative overflow-hidden"
            >
              <div className="absolute inset-0 grid-bg opacity-40" />
              <span className="relative font-display text-5xl font-bold text-gradient">0{i}</span>
            </div>
          ))}
        </div>
      </section>

      <CTASection title="Ready to begin?" description="Book a free 20-minute call. No pitch, just a conversation." />
    </>
  );
};

export default ServiceDetail;
