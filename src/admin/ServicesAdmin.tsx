import { useState } from "react";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import { useStudio, uid } from "@/store/StudioStore";
import { PageHeader, EmptyState } from "./components/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import type { Service, ServiceTier } from "@/store/types";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const emptyService = (): Service => ({
  slug: "", title: "", short: "", icon: "Sparkles", problems: [], process: [], tiers: [],
});
const emptyTier = (): ServiceTier => ({
  id: uid(), name: "New tier", price: "$0", description: "", features: [],
});

const ServicesAdmin = () => {
  const { state, setState } = useStudio();
  const [editing, setEditing] = useState<Service | null>(null);
  const [open, setOpen] = useState(false);

  const openNew = () => { setEditing(emptyService()); setOpen(true); };
  const openEdit = (s: Service) => { setEditing(JSON.parse(JSON.stringify(s))); setOpen(true); };

  const save = () => {
    if (!editing) return;
    if (!editing.title.trim()) return toast({ title: "Title required", variant: "destructive" });
    const slug = editing.slug.trim() || slugify(editing.title);
    const next: Service = { ...editing, slug };
    setState((s) => {
      const exists = s.services.find((x) => x.slug === slug);
      const services = exists ? s.services.map((x) => x.slug === slug ? next : x) : [...s.services, next];
      return { ...s, services };
    });
    toast({ title: "Service saved" });
    setOpen(false);
  };

  const remove = (slug: string) => {
    setState((s) => ({ ...s, services: s.services.filter((x) => x.slug !== slug) }));
    toast({ title: "Service deleted" });
  };

  return (
    <>
      <PageHeader
        title="Services & Tiers"
        description="Each service has tiered packages clients can book. Set pricing, features, and highlight your most popular tier."
        actions={<Button variant="hero" onClick={openNew}><Plus size={16} /> New service</Button>}
      />

      {state.services.length === 0 ? (
        <EmptyState title="No services yet" />
      ) : (
        <div className="space-y-4">
          {state.services.map((svc) => (
            <div key={svc.slug} className="surface-card p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="font-display text-xl font-semibold">{svc.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{svc.short}</p>
                  <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                    <Layers size={12} /> {svc.tiers.length} tiers · icon: <code>{svc.icon}</code>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(svc)}><Pencil size={14} /> Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(svc.slug)} className="text-destructive"><Trash2 size={14} /> Delete</Button>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3 mt-5">
                {svc.tiers.map((t) => (
                  <div key={t.id} className={`rounded-xl border p-4 ${t.highlighted ? "border-primary bg-primary/5" : "border-border bg-secondary/40"}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{t.name}</div>
                      <div className="font-display text-lg">{t.price}</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                    <ul className="text-xs mt-2 space-y-0.5 text-muted-foreground">
                      {t.features.slice(0, 3).map((f, i) => <li key={i}>· {f}</li>)}
                      {t.features.length > 3 && <li>+{t.features.length - 3} more</li>}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit service</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Title</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
                <div><Label>Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="auto from title" /></div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Short description</Label><Input value={editing.short} onChange={(e) => setEditing({ ...editing, short: e.target.value })} /></div>
                <div><Label>Lucide icon name</Label><Input value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} placeholder="Code2, Smartphone..." /></div>
              </div>
              <div>
                <Label>Problems we solve (one per line)</Label>
                <Textarea rows={3} value={editing.problems.join("\n")} onChange={(e) => setEditing({ ...editing, problems: e.target.value.split("\n").filter(Boolean) })} />
              </div>
              <div>
                <Label>Process steps (format: <code>Discovery | Understand goals...</code>, one per line)</Label>
                <Textarea
                  rows={4}
                  value={editing.process.map(p => `${p.step} | ${p.text}`).join("\n")}
                  onChange={(e) => setEditing({
                    ...editing,
                    process: e.target.value.split("\n").map(l => {
                      const [step, text] = l.split("|").map(s => s?.trim() ?? "");
                      return { step, text };
                    }).filter(p => p.step && p.text),
                  })}
                />
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-display font-semibold">Tiers</h4>
                  <Button size="sm" variant="outline" onClick={() => setEditing({ ...editing, tiers: [...editing.tiers, emptyTier()] })}>
                    <Plus size={14} /> Add tier
                  </Button>
                </div>
                <div className="space-y-3">
                  {editing.tiers.map((t, idx) => (
                    <div key={t.id} className="border border-border rounded-lg p-3 space-y-2">
                      <div className="grid md:grid-cols-3 gap-2">
                        <Input placeholder="Name" value={t.name} onChange={(e) => {
                          const tiers = [...editing.tiers]; tiers[idx] = { ...t, name: e.target.value }; setEditing({ ...editing, tiers });
                        }} />
                        <Input placeholder="Price" value={t.price} onChange={(e) => {
                          const tiers = [...editing.tiers]; tiers[idx] = { ...t, price: e.target.value }; setEditing({ ...editing, tiers });
                        }} />
                        <Input placeholder="CTA label" value={t.ctaLabel ?? ""} onChange={(e) => {
                          const tiers = [...editing.tiers]; tiers[idx] = { ...t, ctaLabel: e.target.value }; setEditing({ ...editing, tiers });
                        }} />
                      </div>
                      <Input placeholder="Description" value={t.description} onChange={(e) => {
                        const tiers = [...editing.tiers]; tiers[idx] = { ...t, description: e.target.value }; setEditing({ ...editing, tiers });
                      }} />
                      <Textarea placeholder="Features (one per line)" rows={3} value={t.features.join("\n")} onChange={(e) => {
                        const tiers = [...editing.tiers]; tiers[idx] = { ...t, features: e.target.value.split("\n").filter(Boolean) }; setEditing({ ...editing, tiers });
                      }} />
                      <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={!!t.highlighted} onChange={(e) => {
                            const tiers = editing.tiers.map((x, i) => ({ ...x, highlighted: i === idx ? e.target.checked : false }));
                            setEditing({ ...editing, tiers });
                          }} /> Highlight (recommended)
                        </label>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setEditing({ ...editing, tiers: editing.tiers.filter((_, i) => i !== idx) })}>
                          <Trash2 size={14} /> Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ServicesAdmin;
