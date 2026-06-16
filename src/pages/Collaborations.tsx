import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Filter, Plus, Users, Lock, ShieldCheck, Sparkles,
  Briefcase, ArrowRight, FileText,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CollabConsentGate from "@/components/CollabConsentGate";
import CollaborationFormDialog from "@/components/CollaborationFormDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudio } from "@/store/StudioStore";
import { useCollaborations } from "@/lib/useData";
import { useAdminAuth } from "@/admin/AdminAuth";
import {
  CATEGORIES, STAGES, hasConsent, isVisibleTo, stageLabel,
  visibilityLabel, fundingLabel,
} from "@/lib/collab";
import type { Collaboration } from "@/store/types";

const visibilityIcon = (v: Collaboration["visibility"]) =>
  v === "public" ? Sparkles : v === "invite_only" ? Users : Lock;

const Card = ({ c }: { c: Collaboration }) => {
  const Icon = visibilityIcon(c.visibility);
  return (
    <Link
      to={`/collaborations/${c.id}`}
      className="group surface-card p-6 flex flex-col gap-4 hover:border-primary/60 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="rounded-full">{c.category}</Badge>
            <span>·</span>
            <span>{stageLabel(c.stage)}</span>
          </div>
          <h3 className="font-display text-lg font-bold leading-tight truncate">{c.title}</h3>
        </div>
        <span className="shrink-0 grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground" title={visibilityLabel(c.visibility)}>
          <Icon size={14} />
        </span>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-3">{c.summary}</p>
      <div className="flex flex-wrap gap-1.5">
        {c.rolesNeeded.slice(0, 4).map((r) => (
          <Badge key={r} variant="outline" className="rounded-full text-[10px] uppercase tracking-wide">
            Needs {r}
          </Badge>
        ))}
      </div>
      <div className="mt-auto pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><Users size={12} /> Team {c.teamSize}</span>
        <span>{fundingLabel(c.fundingStatus)}</span>
        <span className="flex items-center gap-1 text-foreground font-medium">
          View <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
};

const Collaborations = () => {
  const { state } = useStudio();
  const { session } = useAdminAuth();
  const navigate = useNavigate();
  const { data: collabData = [] } = useCollaborations();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [stage, setStage] = useState<string>("all");
  const [sort, setSort] = useState<string>("newest");
  const [createOpen, setCreateOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const accepted = hasConsent(state, session?.id);

  const list = useMemo(() => {
    let items = (collabData as Collaboration[]).filter((c) => isVisibleTo(c, session?.id) || c.ownerId === session?.id);
    if (q.trim()) {
      const needle = q.toLowerCase();
      items = items.filter((c) =>
        [c.title, c.summary, c.description, (c.tags ?? []).join(" "), (c.skillsNeeded ?? []).join(" ")]
          .join(" ").toLowerCase().includes(needle),
      );
    }
    if (cat !== "all") items = items.filter((c) => c.category === cat);
    if (stage !== "all") items = items.filter((c) => c.stage === stage);
    if (sort === "newest") items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (sort === "team") items.sort((a, b) => b.teamSize - a.teamSize);
    return items;
  }, [collabData, q, cat, stage, sort, session?.id]);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="container-studio py-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl space-y-3">
              <Badge variant="outline" className="rounded-full">Collaborations</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
                A protected space for ideas, builders, and capital.
              </h1>
              <p className="text-muted-foreground">
                Share startup ideas, find co-founders or contributors, and connect with investors —
                under a clear ownership and consent framework.
              </p>
              <div className="flex flex-wrap gap-2 pt-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck size={12} /> Ownership protected</span>
                <span className="inline-flex items-center gap-1.5"><Lock size={12} /> Consent-gated access</span>
                <span className="inline-flex items-center gap-1.5"><FileText size={12} /> NDA support</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {session && accepted && (
                <Button variant="outline" onClick={() => setReviewOpen(true)}>Review policies</Button>
              )}
              <Button variant="hero" onClick={() => {
                if (!session) return navigate("/portal");
                setCreateOpen(true);
              }}>
                <Plus size={16} /> Share an idea
              </Button>
            </div>
          </div>

          <div className="surface-card p-4 mb-8 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ideas, skills, tags…" className="pl-9" />
            </div>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="md:w-[180px]"><Filter size={14} className="mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="md:w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                {STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="md:w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="team">Team size</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {list.length === 0 ? (
            <div className="surface-card p-12 text-center text-muted-foreground">
              <Briefcase className="mx-auto mb-3" />
              <p className="text-sm">No collaborations match your filters yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {list.map((c) => <Card key={c.id} c={c} />)}
            </div>
          )}

          <div className="mt-16 surface-card p-6 text-xs text-muted-foreground border-dashed">
            <p className="font-semibold text-foreground mb-1">Ownership notice</p>
            <p>
              All ideas displayed remain the intellectual property of their original creators.
              Reproduction, distribution, or commercial use without explicit permission is prohibited
              and may be reported through each project page.
            </p>
          </div>
        </section>
      </main>
      <Footer />

      {session && <CollabConsentGate fullPage />}
      {reviewOpen && <CollabConsentGate forceOpen onClose={() => setReviewOpen(false)} />}
      {createOpen && <CollaborationFormDialog open={createOpen} onOpenChange={setCreateOpen} />}
    </>
  );
};

export default Collaborations;
