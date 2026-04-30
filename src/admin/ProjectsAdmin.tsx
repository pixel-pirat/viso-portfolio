import { useRef, useState } from "react";
import { Pencil, Plus, Trash2, Star, Upload, Image as ImageIcon } from "lucide-react";
import { useStudio } from "@/store/StudioStore";
import { PageHeader, EmptyState } from "./components/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { Project } from "@/store/types";
import { readImageDownscaled } from "@/lib/uploads";

const empty = (): Project => ({
  slug: "", title: "", category: "Web", excerpt: "", problem: "", solution: "",
  tools: [], results: [], isFeatured: false, publishedAt: new Date().toISOString().slice(0, 10),
});

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const ProjectsAdmin = () => {
  const { state, setState } = useStudio();
  const [editing, setEditing] = useState<Project | null>(null);
  const [open, setOpen] = useState(false);

  const openNew = () => { setEditing(empty()); setOpen(true); };
  const openEdit = (p: Project) => { setEditing({ ...p }); setOpen(true); };

  const save = () => {
    if (!editing) return;
    if (!editing.title.trim()) return toast({ title: "Title required", variant: "destructive" });
    const slug = editing.slug.trim() || slugify(editing.title);
    const next: Project = { ...editing, slug };
    setState((s) => {
      const exists = s.projects.find((p) => p.slug === slug);
      const projects = exists
        ? s.projects.map((p) => (p.slug === slug ? next : p))
        : [next, ...s.projects];
      return { ...s, projects };
    });
    toast({ title: "Project saved" });
    setOpen(false);
  };

  const remove = (slug: string) => {
    setState((s) => ({ ...s, projects: s.projects.filter((p) => p.slug !== slug) }));
    toast({ title: "Project deleted" });
  };

  const toggleFeatured = (slug: string) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((p) => p.slug === slug ? { ...p, isFeatured: !p.isFeatured } : p),
    }));
  };

  return (
    <>
      <PageHeader
        title="Projects"
        description="Showcase your best work. Toggle featured to surface them on the homepage."
        actions={<Button variant="hero" onClick={openNew}><Plus size={16} /> New project</Button>}
      />

      {state.projects.length === 0 ? (
        <EmptyState title="No projects yet" action={<Button onClick={openNew}><Plus size={16} /> Add the first</Button>} />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {state.projects.map((p) => (
            <div key={p.slug} className="surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-widest text-primary">{p.category}</div>
                  <h3 className="font-display text-lg font-semibold mt-1 truncate">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.excerpt}</p>
                </div>
                <button
                  onClick={() => toggleFeatured(p.slug)}
                  aria-label="Toggle featured"
                  className={`p-2 rounded-md border ${p.isFeatured ? "bg-primary text-primary-foreground border-transparent" : "border-border text-muted-foreground"}`}
                >
                  <Star size={14} />
                </button>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => openEdit(p)}><Pencil size={14} /> Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(p.slug)} className="text-destructive"><Trash2 size={14} /> Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing && state.projects.some(p => p.slug === editing.slug) ? "Edit" : "New"} project</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Title</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
                <div><Label>Slug (auto if blank)</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="my-project" /></div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v as Project["category"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["Web", "Mobile", "Branding", "Media"] as const).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Published date</Label><Input type="date" value={editing.publishedAt.slice(0, 10)} onChange={(e) => setEditing({ ...editing, publishedAt: e.target.value })} /></div>
              </div>
              <div><Label>Excerpt</Label><Textarea rows={2} value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} /></div>
              <div><Label>Problem</Label><Textarea rows={2} value={editing.problem} onChange={(e) => setEditing({ ...editing, problem: e.target.value })} /></div>
              <div><Label>Solution</Label><Textarea rows={2} value={editing.solution} onChange={(e) => setEditing({ ...editing, solution: e.target.value })} /></div>
              <div>
                <Label>Tools (comma-separated)</Label>
                <Input value={editing.tools.join(", ")} onChange={(e) => setEditing({ ...editing, tools: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
              </div>
              <div>
                <Label>Results (one per line, format: <code>+148% | Conversion rate</code>)</Label>
                <Textarea
                  rows={3}
                  value={editing.results.map(r => `${r.metric} | ${r.label}`).join("\n")}
                  onChange={(e) => setEditing({
                    ...editing,
                    results: e.target.value.split("\n").map(l => {
                      const [metric, label] = l.split("|").map(s => s?.trim() ?? "");
                      return { metric, label };
                    }).filter(r => r.metric && r.label),
                  })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!editing.isFeatured} onChange={(e) => setEditing({ ...editing, isFeatured: e.target.checked })} />
                Featured on homepage
              </label>
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

export default ProjectsAdmin;
