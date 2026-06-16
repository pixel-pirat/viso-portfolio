import { useState } from "react";
import { useStudio } from "@/store/StudioStore";
import { PageHeader } from "./components/AdminUI";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  projectsApi, servicesApi, blogApi, heroApi,
  bookingsApi, settingsApi,
} from "@/lib/api";
import { CheckCircle2, AlertCircle, Loader2, DatabaseZap } from "lucide-react";

type StepStatus = "idle" | "running" | "done" | "error";

type Step = {
  key: string;
  label: string;
  status: StepStatus;
  count?: number;
  error?: string;
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const MigrateAdmin = () => {
  const { state } = useStudio();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [steps, setSteps] = useState<Step[]>([
    { key: "settings", label: "Settings & brand", status: "idle" },
    { key: "services", label: "Services & tiers", status: "idle" },
    { key: "projects", label: "Projects", status: "idle" },
    { key: "blog", label: "Blog posts", status: "idle" },
    { key: "hero", label: "Hero slides & activity", status: "idle" },
    { key: "bookings", label: "Bookings", status: "idle" },
  ]);

  const setStep = (key: string, patch: Partial<Step>) =>
    setSteps((prev) => prev.map((s) => s.key === key ? { ...s, ...patch } : s));

  const run = async () => {
    setRunning(true);
    setDone(false);

    // ── Settings ──────────────────────────────────────────
    setStep("settings", { status: "running" });
    try {
      await settingsApi.update(state.settings);
      setStep("settings", { status: "done", count: 1 });
    } catch (e) {
      setStep("settings", { status: "error", error: (e as Error).message });
    }

    // ── Services ──────────────────────────────────────────
    setStep("services", { status: "running" });
    try {
      let count = 0;
      for (const svc of state.services) {
        const slug = svc.slug || slugify(svc.title);
        try {
          await servicesApi.update(slug, {
            slug, title: svc.title, short: svc.short, icon: svc.icon,
            problems: svc.problems,
            process: svc.process.map((p) => ({ step: p.step, text: p.text })),
            tiers: svc.tiers.map((t) => ({
              id: t.id, name: t.name, price: t.price,
              description: t.description, features: t.features,
              highlighted: t.highlighted, ctaLabel: t.ctaLabel,
            })),
          });
        } catch {
          // Service doesn't exist yet — create it
          await servicesApi.create({
            slug, title: svc.title, short: svc.short, icon: svc.icon,
            problems: svc.problems,
            process: svc.process.map((p) => ({ step: p.step, text: p.text })),
            tiers: svc.tiers.map((t) => ({
              id: t.id, name: t.name, price: t.price,
              description: t.description, features: t.features,
              highlighted: t.highlighted, ctaLabel: t.ctaLabel,
            })),
          });
        }
        count++;
      }
      setStep("services", { status: "done", count });
    } catch (e) {
      setStep("services", { status: "error", error: (e as Error).message });
    }

    // ── Projects ──────────────────────────────────────────
    setStep("projects", { status: "running" });
    try {
      let count = 0;
      for (const p of state.projects) {
        const slug = p.slug || slugify(p.title);
        const payload = {
          slug, title: p.title, category: p.category,
          excerpt: p.excerpt, problem: p.problem, solution: p.solution,
          cover_image: p.coverImage, is_featured: p.isFeatured,
          is_published: true, published_at: p.publishedAt,
          tools: p.tools, results: p.results,
          gallery: p.gallery?.map((g) => ({ url: g.url, alt: g.caption, kind: g.kind, caption: g.caption })) ?? [],
        };
        try {
          await projectsApi.update(slug, payload);
        } catch {
          await projectsApi.create(payload);
        }
        count++;
      }
      setStep("projects", { status: "done", count });
    } catch (e) {
      setStep("projects", { status: "error", error: (e as Error).message });
    }

    // ── Blog ──────────────────────────────────────────────
    setStep("blog", { status: "running" });
    try {
      let count = 0;
      for (const post of state.posts) {
        const slug = post.slug || slugify(post.title);
        const payload = {
          slug, title: post.title, excerpt: post.excerpt,
          content: post.content, category: post.category,
          read_time: post.readTime, is_published: post.isPublished,
          published_at: post.date,
        };
        try {
          await blogApi.update(slug, payload);
        } catch {
          await blogApi.create(payload);
        }
        count++;
      }
      setStep("blog", { status: "done", count });
    } catch (e) {
      setStep("blog", { status: "error", error: (e as Error).message });
    }

    // ── Hero ──────────────────────────────────────────────
    setStep("hero", { status: "running" });
    try {
      let count = 0;
      for (const slide of state.hero.slides) {
        const payload = {
          eyebrow: slide.eyebrow, title: slide.title,
          subtitle: slide.subtitle, cta_label: slide.ctaLabel, cta_href: slide.ctaHref,
        };
        try {
          await heroApi.updateSlide(slide.id, payload);
        } catch {
          await heroApi.createSlide(payload);
        }
        count++;
      }
      for (const item of state.hero.activity) {
        try {
          await heroApi.addActivity({ kind: item.kind, text: item.text });
          count++;
        } catch {
          // ignore duplicates
        }
      }
      setStep("hero", { status: "done", count });
    } catch (e) {
      setStep("hero", { status: "error", error: (e as Error).message });
    }

    // ── Bookings ──────────────────────────────────────────
    setStep("bookings", { status: "running" });
    try {
      let count = 0;
      for (const b of state.bookings) {
        try {
          await bookingsApi.submit({
            name: b.name, email: b.email,
            serviceSlug: b.serviceSlug, tierId: b.tierId,
            message: b.message, clientId: b.clientId,
          });
          count++;
        } catch {
          // may already exist — skip
        }
      }
      setStep("bookings", { status: "done", count });
    } catch (e) {
      setStep("bookings", { status: "error", error: (e as Error).message });
    }

    setRunning(false);
    setDone(true);
    toast({ title: "Migration complete", description: "Your localStorage data has been pushed to the database." });
  };

  const allDone = steps.every((s) => s.status === "done");
  const hasErrors = steps.some((s) => s.status === "error");

  return (
    <>
      <PageHeader
        title="Migrate localStorage → Database"
        description="One-time sync. Reads all data from this browser's localStorage and pushes it to NeonDB so it's visible on every device."
      />

      <div className="surface-card p-6 max-w-2xl space-y-6">
        <div className="rounded-lg bg-secondary border border-border p-4 text-sm text-muted-foreground space-y-1">
          <p>This will push the following from your browser to the database:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong className="text-foreground">{state.services.length}</strong> services</li>
            <li><strong className="text-foreground">{state.projects.length}</strong> projects</li>
            <li><strong className="text-foreground">{state.posts.length}</strong> blog posts</li>
            <li><strong className="text-foreground">{state.hero.slides.length}</strong> hero slides + {state.hero.activity.length} activity items</li>
            <li><strong className="text-foreground">{state.bookings.length}</strong> bookings</li>
            <li>Settings & brand info</li>
          </ul>
          <p className="mt-3 text-xs">Existing records in the database will be updated. Nothing is deleted.</p>
        </div>

        <ul className="space-y-2">
          {steps.map((step) => (
            <li key={step.key} className="flex items-center gap-3 text-sm">
              <span className="w-5 shrink-0">
                {step.status === "idle" && <span className="block h-2 w-2 rounded-full bg-border mx-auto" />}
                {step.status === "running" && <Loader2 size={16} className="animate-spin text-primary" />}
                {step.status === "done" && <CheckCircle2 size={16} className="text-emerald-500" />}
                {step.status === "error" && <AlertCircle size={16} className="text-destructive" />}
              </span>
              <span className={step.status === "error" ? "text-destructive" : "text-foreground"}>
                {step.label}
              </span>
              {step.status === "done" && step.count !== undefined && (
                <span className="text-xs text-muted-foreground ml-auto">{step.count} synced</span>
              )}
              {step.status === "error" && (
                <span className="text-xs text-destructive ml-auto truncate max-w-xs">{step.error}</span>
              )}
            </li>
          ))}
        </ul>

        {done && allDone && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-sm text-emerald-600 dark:text-emerald-400">
            ✅ All data synced to the database. Changes will now appear on every device.
          </div>
        )}

        {done && hasErrors && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
            Some steps had errors. Check the details above — you can run migration again to retry failed steps.
          </div>
        )}

        <Button
          variant="hero"
          onClick={run}
          disabled={running}
          className="w-full sm:w-auto"
        >
          {running
            ? <><Loader2 size={16} className="animate-spin" /> Migrating...</>
            : <><DatabaseZap size={16} /> {done ? "Run again" : "Start migration"}</>
          }
        </Button>
      </div>
    </>
  );
};

export default MigrateAdmin;
