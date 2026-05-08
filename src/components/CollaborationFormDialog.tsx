import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudio } from "@/store/StudioStore";
import { useAdminAuth } from "@/admin/AdminAuth";
import {
  CATEGORIES, FUNDING_STATUSES, ROLES_NEEDED, STAGES, VISIBILITY,
  newCollaboration,
} from "@/lib/collab";
import type { Collaboration } from "@/store/types";
import { toast } from "@/hooks/use-toast";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Collaboration;
};

const CollaborationFormDialog = ({ open, onOpenChange, initial }: Props) => {
  const { setState } = useStudio();
  const { session } = useAdminAuth();
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    summary: initial?.summary ?? "",
    description: initial?.description ?? "",
    goals: initial?.goals ?? "",
    category: initial?.category ?? "SaaS",
    stage: initial?.stage ?? "idea",
    visibility: initial?.visibility ?? "public",
    fundingStatus: initial?.fundingStatus ?? "n/a",
    fundingGoal: initial?.fundingGoal ?? "",
    teamSize: initial?.teamSize ?? 1,
    tags: initial?.tags.join(", ") ?? "",
    skillsNeeded: initial?.skillsNeeded.join(", ") ?? "",
    rolesNeeded: initial?.rolesNeeded ?? [],
    requiresNda: initial?.requiresNda ?? false,
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleRole = (r: typeof ROLES_NEEDED[number]["value"]) =>
    setForm((f) => ({
      ...f,
      rolesNeeded: f.rolesNeeded.includes(r) ? f.rolesNeeded.filter((x) => x !== r) : [...f.rolesNeeded, r],
    }));

  const submit = () => {
    if (!session) return;
    if (!form.title.trim() || !form.summary.trim()) {
      toast({ title: "Missing fields", description: "Title and summary are required.", variant: "destructive" });
      return;
    }
    const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
    setState((s) => {
      if (initial) {
        return {
          ...s,
          collaborations: s.collaborations.map((c) => c.id === initial.id ? {
            ...c,
            ...form,
            tags: split(form.tags),
            skillsNeeded: split(form.skillsNeeded),
            updatedAt: new Date().toISOString(),
          } : c),
        };
      }
      const created = newCollaboration({
        ownerId: session.id,
        ownerName: session.name,
        ownerEmail: session.email,
        ...form,
        tags: split(form.tags),
        skillsNeeded: split(form.skillsNeeded),
      });
      return { ...s, collaborations: [created, ...s.collaborations] };
    });
    toast({ title: initial ? "Collaboration updated" : "Collaboration published" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit collaboration" : "Share an idea"}</DialogTitle>
          <DialogDescription>
            Public projects are discoverable by all members. Sensitive details should use Invite-only or NDA.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Project title</Label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} maxLength={120} />
          </div>
          <div>
            <Label>Short summary</Label>
            <Input value={form.summary} onChange={(e) => update("summary", e.target.value)} maxLength={200} />
          </div>
          <div>
            <Label>Full description</Label>
            <Textarea rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} maxLength={4000} />
          </div>
          <div>
            <Label>Goals & vision</Label>
            <Textarea rows={3} value={form.goals} onChange={(e) => update("goals", e.target.value)} maxLength={2000} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => update("category", v as Collaboration["category"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stage</Label>
              <Select value={form.stage} onValueChange={(v) => update("stage", v as Collaboration["stage"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Visibility</Label>
              <Select value={form.visibility} onValueChange={(v) => update("visibility", v as Collaboration["visibility"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{VISIBILITY.map((v) => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Funding status</Label>
              <Select value={form.fundingStatus} onValueChange={(v) => update("fundingStatus", v as Collaboration["fundingStatus"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FUNDING_STATUSES.map((v) => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Funding goal (optional)</Label>
              <Input value={form.fundingGoal} onChange={(e) => update("fundingGoal", e.target.value)} placeholder="$250k pre-seed" />
            </div>
            <div>
              <Label>Team size</Label>
              <Input type="number" min={1} value={form.teamSize} onChange={(e) => update("teamSize", Number(e.target.value) || 1)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Tags (comma separated)</Label>
              <Input value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="ai, productivity" />
            </div>
            <div>
              <Label>Skills needed (comma separated)</Label>
              <Input value={form.skillsNeeded} onChange={(e) => update("skillsNeeded", e.target.value)} placeholder="React, GTM" />
            </div>
          </div>

          <div>
            <Label>Roles you're looking for</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {ROLES_NEEDED.map((r) => {
                const active = form.rolesNeeded.includes(r.value);
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => toggleRole(r.value)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={form.requiresNda} onCheckedChange={(v) => update("requiresNda", !!v)} />
            Require NDA acknowledgment before viewing sensitive details
          </label>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="hero" onClick={submit}>{initial ? "Save changes" : "Publish"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CollaborationFormDialog;
