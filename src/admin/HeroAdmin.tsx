import { useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useStudio, uid } from "@/store/StudioStore";
import { useApi } from "@/lib/useApi";
import { PageHeader } from "./components/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { HeroSlide, ActivityItem } from "@/store/types";

const HeroAdmin = () => {
  const { state } = useStudio();
  const { saveSlide, deleteSlide, moveSlide, saveActivity, deleteActivity } = useApi();
  const [slide, setSlide] = useState<HeroSlide | null>(null);
  const [open, setOpen] = useState(false);
  const [activity, setActivity] = useState<ActivityItem | null>(null);
  const [aOpen, setAOpen] = useState(false);

  const newSlide = (): HeroSlide => ({ id: uid(), eyebrow: "", title: "", subtitle: "", ctaLabel: "Start a Project", ctaHref: "/contact" });
  const newActivity = (): ActivityItem => ({ id: uid(), kind: "note", text: "", timestamp: new Date().toISOString() });

  const handleSaveSlide = async () => {
    if (!slide) return;
    const isNew = !state.hero.slides.find((x) => x.id === slide.id);
    await saveSlide(slide, isNew);
    toast({ title: "Slide saved" });
    setOpen(false);
  };

  const handleMoveSlide = (id: string, dir: -1 | 1) => moveSlide(id, dir);
  const handleDeleteSlide = (id: string) => deleteSlide(id);

  const handleSaveActivity = async () => {
    if (!activity) return;
    const isNew = !state.hero.activity.find((x) => x.id === activity.id);
    await saveActivity(activity, isNew);
    setAOpen(false);
  };

  const handleDeleteActivity = (id: string) => deleteActivity(id);

  return (
    <>
      <PageHeader
        title="Hero Feed"
        description="Rotating slides for the homepage hero, plus an activity ticker showing what's new."
      />

      <section className="surface-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Rotating slides</h2>
          <Button variant="hero" size="sm" onClick={() => { setSlide(newSlide()); setOpen(true); }}><Plus size={14} /> Add slide</Button>
        </div>
        <div className="space-y-3">
          {state.hero.slides.map((sl, i) => (
            <div key={sl.id} className="border border-border rounded-lg p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-widest text-primary">{sl.eyebrow || "—"}</div>
                <div className="font-display font-semibold mt-1">{sl.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{sl.subtitle}</div>
                <div className="text-xs text-muted-foreground mt-2">CTA: <code>{sl.ctaLabel}</code> → <code>{sl.ctaHref}</code></div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => handleMoveSlide(sl.id, -1)} disabled={i === 0}><ArrowUp size={14} /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleMoveSlide(sl.id, 1)} disabled={i === state.hero.slides.length - 1}><ArrowDown size={14} /></Button>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => { setSlide(sl); setOpen(true); }}><Pencil size={13} /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteSlide(sl.id)}><Trash2 size={13} /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Activity ticker</h2>
          <Button variant="hero" size="sm" onClick={() => { setActivity(newActivity()); setAOpen(true); }}><Plus size={14} /> Add activity</Button>
        </div>
        <ul className="divide-y divide-border">
          {state.hero.activity.map((a) => (
            <li key={a.id} className="py-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-primary">{a.kind}</div>
                <div className="text-sm mt-1">{a.text}</div>
                <div className="text-xs text-muted-foreground">{new Date(a.timestamp).toLocaleString()}</div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => { setActivity(a); setAOpen(true); }}><Pencil size={13} /></Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteActivity(a.id)}><Trash2 size={13} /></Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Slide dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Hero slide</DialogTitle></DialogHeader>
          {slide && (
            <div className="space-y-3">
              <div><Label>Eyebrow</Label><Input value={slide.eyebrow} onChange={(e) => setSlide({ ...slide, eyebrow: e.target.value })} /></div>
              <div><Label>Title</Label><Input value={slide.title} onChange={(e) => setSlide({ ...slide, title: e.target.value })} /></div>
              <div><Label>Subtitle</Label><Textarea rows={2} value={slide.subtitle} onChange={(e) => setSlide({ ...slide, subtitle: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>CTA label</Label><Input value={slide.ctaLabel} onChange={(e) => setSlide({ ...slide, ctaLabel: e.target.value })} /></div>
                <div><Label>CTA href</Label><Input value={slide.ctaHref} onChange={(e) => setSlide({ ...slide, ctaHref: e.target.value })} /></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={handleSaveSlide}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity dialog */}
      <Dialog open={aOpen} onOpenChange={setAOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Activity item</DialogTitle></DialogHeader>
          {activity && (
            <div className="space-y-3">
              <div>
                <Label>Kind</Label>
                <Select value={activity.kind} onValueChange={(v) => setActivity({ ...activity, kind: v as ActivityItem["kind"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["project", "blog", "service", "note"] as const).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Text</Label><Input value={activity.text} onChange={(e) => setActivity({ ...activity, text: e.target.value })} /></div>
              <div><Label>Timestamp</Label><Input type="datetime-local" value={activity.timestamp.slice(0, 16)} onChange={(e) => setActivity({ ...activity, timestamp: new Date(e.target.value).toISOString() })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={handleSaveActivity}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeroAdmin;
