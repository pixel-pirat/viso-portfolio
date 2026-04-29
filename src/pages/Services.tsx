import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import CTASection from "@/components/CTASection";
import { useStudio } from "@/store/StudioStore";
import { getIcon } from "@/lib/icons";

const Services = () => {
  const { state } = useStudio();
  return (
    <>
      <section className="container-studio pt-20 pb-12">
        <SectionHeader
          eyebrow="Services"
          title="Everything you need, under one roof."
          description="From the first sketch to the final pixel — we cover product strategy, brand, design, engineering, and content. Each service comes with tiered packages."
        />
      </section>

      <section className="container-studio pb-24">
        <div className="grid md:grid-cols-2 gap-5">
          {state.services.map((s, i) => {
            const Icon = getIcon(s.icon);
            return (
              <Link key={s.slug} to={`/services/${s.slug}`} className="group surface-card p-8 block">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-xl bg-secondary border border-border text-primary group-hover:bg-gradient-primary group-hover:text-primary-foreground group-hover:border-transparent transition-all">
                    <Icon size={24} />
                  </div>
                  <span className="text-xs text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="font-display text-2xl font-semibold mt-6">{s.title}</h3>
                <p className="text-muted-foreground mt-3">{s.short}</p>
                {s.tiers.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {s.tiers.map((t) => (
                      <span key={t.id} className={`text-[11px] px-2 py-0.5 rounded-full border ${t.highlighted ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
                        {t.name} · {t.price}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-6 inline-flex items-center gap-1 text-sm text-primary group-hover:gap-2 transition-all">
                  Explore service <ArrowRight size={16} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <CTASection title="Not sure where to start?" description="Tell us your goal. We'll recommend the right service mix." />
    </>
  );
};

export default Services;
