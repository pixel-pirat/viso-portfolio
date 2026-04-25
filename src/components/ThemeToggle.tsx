import { Palette, Minus } from "lucide-react";
import { useTheme, ThemeName } from "./ThemeProvider";
import { cn } from "@/lib/utils";

const options: { value: ThemeName; label: string; icon: typeof Palette }[] = [
  { value: "mono", label: "Mono", icon: Minus },
  { value: "playful", label: "Playful", icon: Palette },
];

const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 backdrop-blur p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const active = theme === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon size={12} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
