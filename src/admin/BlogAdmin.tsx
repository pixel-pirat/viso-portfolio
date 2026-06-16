import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useStudio } from "@/store/StudioStore";
import { useApi } from "@/lib/useApi";
import { PageHeader, EmptyState } from "./components/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { BlogPost } from "@/store/types";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const empty = (): BlogPost => ({
  slug: "", title: "", excerpt: "", date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  category: "Design", readTime: "5 min", content: [""], isPublished: true,
});

const BlogAdmin = () => {
  const { state } = useStudio();
  const { savePost, togglePostPublish, deletePost } = useApi();
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [open, setOpen] = useState(false);

  const openNew = () => { setEditing(empty()); setOpen(true); };
  const openEdit = (p: BlogPost) => { setEditing({ ...p }); setOpen(true); };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) return toast({ title: "Title required", variant: "destructive" });
    const isNew = !state.posts.find((x) => x.slug === (editing.slug || editing.title));
    await savePost(editing, isNew);
    toast({ title: "Post saved" });
    setOpen(false);
  };

  const toggle = (slug: string, current: boolean) => togglePostPublish(slug, !current);
  const remove = async (slug: string) => { await deletePost(slug); toast({ title: "Post deleted" }); };

  return (
    <>
      <PageHeader
        title="Blog"
        description="Write essays, case-study notes, and updates."
        actions={<Button variant="hero" onClick={openNew}><Plus size={16} /> New post</Button>}
      />

      {state.posts.length === 0 ? <EmptyState title="No posts yet" /> : (
        <div className="space-y-3">
          {state.posts.map((p) => (
            <div key={p.slug} className="surface-card p-5 flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-primary uppercase tracking-widest">{p.category}</span>
                  <span>·</span><span>{p.date}</span><span>·</span><span>{p.readTime}</span>
                  {!p.isPublished && <span className="ml-2 px-2 py-0.5 rounded-full bg-secondary border border-border">Draft</span>}
                </div>
                <h3 className="font-display text-lg font-semibold mt-1">{p.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl line-clamp-2">{p.excerpt}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toggle(p.slug, p.isPublished)}>
                  {p.isPublished ? <><EyeOff size={14} /> Unpublish</> : <><Eye size={14} /> Publish</>}
                </Button>
                <Button size="sm" variant="outline" onClick={() => openEdit(p)}><Pencil size={14} /> Edit</Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(p.slug)}><Trash2 size={14} /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Post</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v as BlogPost["category"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["Design", "Engineering", "Branding", "Process"] as const).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Date</Label><Input value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></div>
                <div><Label>Read time</Label><Input value={editing.readTime} onChange={(e) => setEditing({ ...editing, readTime: e.target.value })} /></div>
              </div>
              <div><Label>Excerpt</Label><Textarea rows={2} value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} /></div>
              <div>
                <Label>Content (one paragraph per line)</Label>
                <Textarea rows={10} value={editing.content.join("\n")} onChange={(e) => setEditing({ ...editing, content: e.target.value.split("\n") })} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.isPublished} onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })} />
                Published
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

export default BlogAdmin;
