import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

const SectionHeader = ({ eyebrow, title, description, align = "left", className }: Props) => (
  <div
    className={cn(
      "max-w-3xl space-y-4",
      align === "center" && "mx-auto text-center",
      className,
    )}
  >
    {eyebrow && (
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-glow-pulse" />
        {eyebrow}
      </span>
    )}
    <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-gradient">
      {title}
    </h2>
    {description && (
      <p className="text-lg text-muted-foreground leading-relaxed">{description}</p>
    )}
  </div>
);

export default SectionHeader;
