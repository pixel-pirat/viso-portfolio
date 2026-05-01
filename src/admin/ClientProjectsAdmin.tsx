import { useMemo, useState, useRef } from "react";
import { useStudio, uid } from "@/store/StudioStore";
import { PageHeader, EmptyState } from "./components/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ChevronRight, Paperclip, Download, Send, CheckCircle2, FileText } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import type {
  ClientProject, ClientProjectStage, Milestone, MilestoneStatus, Invoice,
} from "@/store/types";
import {
  STAGES, stageLabel, stageColor, milestoneProgress,
} from "@/lib/lifecycle";
import { fileToAttachment, downloadDataUrl } from "@/lib/uploads";
import { toast } from "@/hooks/use-toast";

const MS_STATUSES: MilestoneStatus[] = ["pending", "in_progress", "review", "done"];

const ClientProjectsAdmin = () => {
  const { state, setState } = useStudio();
  const [activeId, setActiveId] = useState<string | null>(state.clientProjects[0]?.id ?? null);

  const active = useMemo(
    () => state.clientProjects.find((p) => p.id === activeId) ?? null,
    [state.clientProjects, activeId],
  );

  const updateProject = (id: string, fn: (p: ClientProject) => ClientProject) =>
    setState((s) => ({ ...s, clientProjects: s.clientProjects.map((p) => p.id === id ? fn(p) : p) }));

  const removeProject = (id: string) => {
    setState((s) => ({ ...s, clientProjects: s.clientProjects.filter((p) => p.id !== id) }));
    if (activeId === id) setActiveId(null);
  };

  return (
    <>
      <PageHeader
        title="Client projects"
        description="Track active engagements: milestones, messages, and invoices for each client."
      />

      {state.clientProjects.length === 0 ? (
        <EmptyState
          title="No active projects"
          description="Convert an accepted proposal into a project from the Proposals page."
        />
      ) : (
        <div className="grid lg:grid-cols-[320px_1fr] gap-5">
          <aside className="surface-card p-3 space-y-1 lg:sticky lg:top-4 lg:self-start max-h-[80vh] overflow-y-auto">
            {state.clientProjects.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${activeId === p.id ? "bg-secondary" : "hover:bg-secondary/60"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm truncate">{p.title}</span>
                  <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">{p.clientName}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full ${stageColor[p.stage]}`}>{p.stage}</span>
                  <span className="text-[10px] text-muted-foreground">{milestoneProgress(p.milestones)}%</span>
                </div>
              </button>
            ))}
          </aside>

          {active ? (
            <ProjectDetail
              project={active}
              onUpdate={(fn) => updateProject(active.id, fn)}
              onRemove={() => removeProject(active.id)}
            />
          ) : (
            <div className="surface-card p-10 text-center text-muted-foreground">Select a project.</div>
          )}
        </div>
      )}
    </>
  );
};

/* ============================================================== */

const ProjectDetail = ({ project, onUpdate, onRemove }: {
  project: ClientProject;
  onUpdate: (fn: (p: ClientProject) => ClientProject) => void;
  onRemove: () => void;
}) => {
  const [msMode, setMsMode] = useState<{ open: boolean; ms?: Milestone }>({ open: false });
  const [invMode, setInvMode] = useState<{ open: boolean; inv?: Invoice }>({ open: false });
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const sendMessage = () => {
    const body = msg.trim();
    if (!body) return;
    onUpdate((p) => ({
      ...p,
      messages: [...p.messages, {
        id: uid(), authorId: "admin", authorName: "Studio",
        authorRole: "admin", body, createdAt: new Date().toISOString(),
      }],
    }));
    setMsg("");
  };

  const onAttachDeliverable = async (msId: string, files: FileList | null) => {
    if (!files?.length) return;
    const ats = await Promise.all(Array.from(files).map(async (f) => {
      try { return await fileToAttachment(f); } catch (e) { toast({ title: "Skipped", description: (e as Error).message, variant: "destructive" }); return null; }
    }));
    const valid = ats.filter(Boolean) as NonNullable<typeof ats[number]>[];
    onUpdate((p) => ({
      ...p,
      milestones: p.milestones.map((m) => m.id === msId ? { ...m, deliverables: [...(m.deliverables ?? []), ...valid] } : m),
    }));
  };

  return (
    <div className="space-y-5">
      <div className="surface-card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${stageColor[project.stage]}`}>{project.stage}</span>
              <span className="text-xs text-muted-foreground">Started {new Date(project.startedAt).toLocaleDateString()}</span>
            </div>
            <h2 className="font-display text-2xl font-bold mt-2">{project.title}</h2>
            <div className="text-sm text-muted-foreground">{project.clientName} · {project.clientEmail}</div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={project.stage} onValueChange={(v) => onUpdate((p) => ({ ...p, stage: v as ClientProjectStage }))}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => <SelectItem key={s} value={s}>{stageLabel(s)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={onRemove}>
              <Trash2 size={14} />
            </Button>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Milestone progress</span>
            <span>{milestoneProgress(project.milestones)}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-gradient-primary transition-all" style={{ width: `${milestoneProgress(project.milestones)}%` }} />
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="surface-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">Milestones</h3>
          <Button size="sm" variant="outline" onClick={() => setMsMode({ open: true })}>
            <Plus size={14} /> Add milestone
          </Button>
        </div>

        <ul className="space-y-2">
          {project.milestones.map((m) => (
            <li key={m.id} className="rounded-lg border border-border p-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="font-medium">{m.title}</div>
                  {m.description && <div className="text-sm text-muted-foreground mt-0.5">{m.description}</div>}
                  {m.dueDate && <div className="text-xs text-muted-foreground mt-1">Due {new Date(m.dueDate).toLocaleDateString()}</div>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select value={m.status} onValueChange={(v) => onUpdate((p) => ({
                    ...p, milestones: p.milestones.map((x) => x.id === m.id ? { ...x, status: v as MilestoneStatus } : x),
                  }))}>
                    <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MS_STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="ghost" onClick={() => setMsMode({ open: true, ms: m })}>Edit</Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onUpdate((p) => ({
                    ...p, milestones: p.milestones.filter((x) => x.id !== m.id),
                  }))}><Trash2 size={14} /></Button>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <input
                  ref={fileRef}
                  type="file" multiple className="hidden"
                  id={`ms-files-${m.id}`}
                  onChange={(e) => { onAttachDeliverable(m.id, e.target.files); e.target.value = ""; }}
                />
                <label htmlFor={`ms-files-${m.id}`}>
                  <Button size="sm" variant="outline" type="button" asChild>
                    <span><Paperclip size={12} /> Add deliverable</span>
                  </Button>
                </label>
                {(m.deliverables ?? []).map((a) => (
                  <span key={a.id} className="text-xs rounded-full border border-border bg-background px-2 py-1 flex items-center gap-1.5">
                    <FileText size={11} /> {a.name}
                    <button onClick={() => downloadDataUrl(a.dataUrl, a.name)} className="text-muted-foreground hover:text-foreground"><Download size={11} /></button>
                  </span>
                ))}
              </div>
            </li>
          ))}
          {project.milestones.length === 0 && <li className="text-sm text-muted-foreground">No milestones yet.</li>}
        </ul>
      </div>

      {/* Invoices */}
      <div className="surface-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">Invoices</h3>
          <Button size="sm" variant="outline" onClick={() => setInvMode({ open: true })}>
            <Plus size={14} /> Add invoice
          </Button>
        </div>

        <ul className="divide-y divide-border">
          {project.invoices.map((inv) => (
            <li key={inv.id} className="py-3 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="font-medium text-sm">{inv.number} — {inv.description}</div>
                <div className="text-xs text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString()}{inv.paidAt && ` · paid ${new Date(inv.paidAt).toLocaleDateString()}`}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{inv.amount}</span>
                <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  inv.status === "paid" ? "bg-emerald-500 text-white"
                  : inv.status === "sent" ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground border border-border"}`}>{inv.status}</span>
                {inv.status !== "paid" && (
                  <Button size="sm" variant="ghost" onClick={() => onUpdate((p) => ({
                    ...p, invoices: p.invoices.map((x) => x.id === inv.id ? { ...x, status: "paid", paidAt: new Date().toISOString() } : x),
                  }))}><CheckCircle2 size={14} /> Mark paid</Button>
                )}
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onUpdate((p) => ({
                  ...p, invoices: p.invoices.filter((x) => x.id !== inv.id),
                }))}><Trash2 size={14} /></Button>
              </div>
            </li>
          ))}
          {project.invoices.length === 0 && <li className="text-sm text-muted-foreground py-2">No invoices.</li>}
        </ul>
      </div>

      {/* Messages */}
      <div className="surface-card p-5">
        <h3 className="font-display text-lg font-semibold mb-4">Messages</h3>
        <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {project.messages.map((m) => (
            <li key={m.id} className={`flex ${m.authorRole === "admin" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${m.authorRole === "admin" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                <div className="text-[10px] uppercase tracking-widest opacity-70 mb-1">{m.authorName}</div>
                <div className="whitespace-pre-wrap">{m.body}</div>
                <div className="text-[10px] opacity-60 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
              </div>
            </li>
          ))}
          {project.messages.length === 0 && <li className="text-sm text-muted-foreground">No messages yet.</li>}
        </ul>
        <div className="flex gap-2 mt-4">
          <Textarea rows={2} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Message client..." />
          <Button onClick={sendMessage} variant="hero" className="self-end"><Send size={14} /> Send</Button>
        </div>
      </div>

      <MilestoneDialog
        open={msMode.open} onOpenChange={(v) => setMsMode({ open: v, ms: v ? msMode.ms : undefined })}
        existing={msMode.ms}
        onSave={(data) => {
          onUpdate((p) => {
            if (msMode.ms) {
              return { ...p, milestones: p.milestones.map((m) => m.id === msMode.ms!.id ? { ...m, ...data } : m) };
            }
            return { ...p, milestones: [...p.milestones, { id: uid(), status: "pending", ...data }] };
          });
          setMsMode({ open: false });
        }}
      />

      <InvoiceDialog
        open={invMode.open} onOpenChange={(v) => setInvMode({ open: v, inv: v ? invMode.inv : undefined })}
        existing={invMode.inv}
        nextNumber={`INV-${String(project.invoices.length + 1).padStart(3, "0")}`}
        onSave={(data) => {
          onUpdate((p) => ({
            ...p,
            invoices: [...p.invoices, { id: uid(), createdAt: new Date().toISOString(), status: "sent", ...data }],
          }));
          setInvMode({ open: false });
        }}
      />
    </div>
  );
};

const MilestoneDialog = ({ open, onOpenChange, existing, onSave }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  existing?: Milestone;
  onSave: (data: { title: string; description?: string; dueDate?: string; status?: MilestoneStatus }) => void;
}) => {
  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [dueDate, setDueDate] = useState(existing?.dueDate?.slice(0, 10) ?? "");

  return (
    <Dialog open={open} onOpenChange={(v) => {
      onOpenChange(v);
      if (v) {
        setTitle(existing?.title ?? "");
        setDescription(existing?.description ?? "");
        setDueDate(existing?.dueDate?.slice(0, 10) ?? "");
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{existing ? "Edit milestone" : "New milestone"}</DialogTitle></DialogHeader>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; onSave({ title, description: description || undefined, dueDate: dueDate ? new Date(dueDate).toISOString() : undefined }); }}>
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
          <div><Label>Description</Label><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div><Label>Due date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
          <DialogFooter><Button type="submit" variant="hero">Save</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const InvoiceDialog = ({ open, onOpenChange, existing, nextNumber, onSave }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  existing?: Invoice;
  nextNumber: string;
  onSave: (data: { number: string; description: string; amount: string }) => void;
}) => {
  const [number, setNumber] = useState(existing?.number ?? nextNumber);
  const [description, setDescription] = useState(existing?.description ?? "");
  const [amount, setAmount] = useState(existing?.amount ?? "");

  return (
    <Dialog open={open} onOpenChange={(v) => {
      onOpenChange(v);
      if (v) {
        setNumber(existing?.number ?? nextNumber);
        setDescription(existing?.description ?? "");
        setAmount(existing?.amount ?? "");
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{existing ? "Edit invoice" : "New invoice"}</DialogTitle></DialogHeader>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (!description.trim() || !amount.trim()) return; onSave({ number, description, amount }); }}>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Number</Label><Input value={number} onChange={(e) => setNumber(e.target.value)} /></div>
            <div><Label>Amount</Label><Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="$2,000" required /></div>
          </div>
          <div><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} required /></div>
          <DialogFooter><Button type="submit" variant="hero">Save</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientProjectsAdmin;
