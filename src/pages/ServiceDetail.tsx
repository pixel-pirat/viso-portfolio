import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import CTASection from "@/components/CTASection";
import BookingDialog from "@/components/BookingDialog";
import { useService } from "@/lib/useData";
import { getIcon } from "@/lib/icons";
import type { ServiceTier } from "@/store/types";

const ServiceDetail = () => {
  const { slug } = useParams();
  const { data: service, isLoading } = useService(slug ?? "");
  const [bookingTier, setBookingTier] = useState<ServiceTier | null>(null);

  if (isLoading) {
    return (
      <section className="container-studio py-32 text-center">
        <h1 className="text-2xl font-display text-muted-foreground animate-pulse">Loading service...</h1>
      </section>
    );
  }

  if (!service) {
    return (
      <section className="container-studio py-32 text-center">
        <h1 className="text-4xl font-display font-bold">Service not found</h1>
        <Button asChild variant="hero" className="mt-6"><Link to="/services">Back to services</Link></Button>
      </section>
    );
  }

  const Icon = getIcon(service.icon);

  return (
    <>
      <section className="container-studio pt-20 pb-16">
        <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← All services</Link>
        <div className="mt-8 grid lg:grid-cols-[1fr_auto] gap-8 items-end">
          <div className="space-y-6 max-w-3xl">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
              <Icon size={28} />
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight text-gradient">{service.title}</h1>
            <p className="text-xl text-muted-foreground">{service.short}</p>
          </div>
          <Button asChild variant="hero" size="lg"><Link to="/contact">Talk to us <ArrowRight /></Link></Button>
        </div>
      </section>

      {/* PRICING TIERS */}
      {service.tiers.length > 0 && (
        <section className="container-studio py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-primary">Packages</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mt-3">Pick what fits</h2>
            <p className="text-muted-foreground mt-3">Transparent pricing. Pick a tier and book — we'll confirm scope on the call.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {service.tiers.map((t) => (
              <div
                key={t.id}
                className={`surface-card p-7 flex flex-col ${t.highlighted ? "border-primary shadow-elegant relative" : ""}`}
              >
                {t.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground text-[10px] uppercase tracking-widest font-semibold shadow-glow">
                    Most popular
                  </span>
                )}
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{t.name}</div>
                <div className="font-display text-4xl font-bold mt-2 text-gradient-brand">{t.price}</div>
                <p className="text-sm text-muted-foreground mt-3">{t.description}</p>
                <ul className="mt-5 space-y-2 flex-1">
                  {t.features.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm items-start">
                      <Check size={14} className="text-primary mt-1 shrink-0" /> <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={t.highlighted ? "hero" : "outline"}
                  className="mt-6 w-full"
                  onClick={() => setBookingTier(t)}
                >
                  {t.ctaLabel ?? `Book ${t.name}`}
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PROBLEMS */}
      {service.problems.length > 0 && (
        <section className="container-studio py-16">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <span className="text-xs uppercase tracking-widest text-primary">Problems we solve</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mt-3">Recognize any of these?</h2>
            </div>
            <ul className="space-y-3">
              {service.problems.map((p) => (
                <li key={p} className="surface-card p-5 flex gap-3 items-start">
                  <span className="grid h-6 w-6 mt-0.5 place-items-center rounded-full bg-destructive/15 text-destructive text-xs">✕</span>
                  <span className="text-foreground">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* PROCESS */}
      {service.process.length > 0 && (
        <section className="container-studio py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-primary">Our process</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mt-3">How we deliver</h2>
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
      )}

      <CTASection title="Ready to begin?" description="Book a free 20-minute call. No pitch, just a conversation." />

      {bookingTier && (
        <BookingDialog
          service={service}
          tier={bookingTier}
          open={!!bookingTier}
          onOpenChange={(v) => !v && setBookingTier(null)}
        />
      )}
    </>
  );
};

export default ServiceDetail;
