import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
}

const CTASection = ({
  title = "Let's build something serious.",
  description = "Tell us about your project. We'll get back within one business day.",
  primaryLabel = "Start a Project",
  primaryTo = "/contact",
  secondaryLabel = "View Work",
  secondaryTo = "/projects",
}: Props) => (
  <section className="container-studio py-24">
    <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-surface p-10 md:p-20">
      <div className="absolute inset-0 bg-gradient-glow opacity-60 pointer-events-none" />
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent-purple/20 blur-3xl" />
      <div className="relative max-w-2xl space-y-6">
        <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-gradient">
          {title}
        </h2>
        <p className="text-lg text-muted-foreground">{description}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="hero" size="lg">
            <Link to={primaryTo}>
              {primaryLabel} <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to={secondaryTo}>{secondaryLabel}</Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export default CTASection;
