import { useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useStudio, uid } from "@/store/StudioStore";
import { useAdminAuth } from "@/admin/AdminAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Download, FileText, Paperclip, CheckCircle2 } from "lucide-react";
import { stageColor, stageLabel, milestoneProgress, STAGES } from "@/lib/lifecycle";
import { downloadDataUrl, fileToAttachment } from "@/lib/uploads";
import { toast } from "@/hooks/use-toast";
import { realtime } from "@/lib/realtime";
import { exportInvoicePdf, exportProjectSummaryPdf } from "@/lib/pdf";
import type { ClientProject } from "@/store/types";

const PortalProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, setState } = useStudio();
  const { session } = useAdminAuth();
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const project = state.clientProjects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="surface-card p-10 text-center">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="hero" className="mt-4" onClick={() => navigate("/portal/projects")}>Back to projects</Button>
      </div>
    );
  }

  const update = (fn: (p: ClientProject) => ClientProject) =>
    setState((s) => ({ ...s, clientProjects: s.clientProjects.map((p) => p.id === project.id ? fn(p) : p) }));

  const sendMessage = () => {
    const body = msg.trim();
    if (!body || !session) return;
    update((p) => ({
      ...p,
      messages: [...p.messages, {
        id: uid(),
        authorId: session.id,
        authorName: session.name,
        authorRole: "client",
        body,
        createdAt: new Date().toISOString(),
      }],
    }));
    realtime.publish({
      kind: "message",
      title: `New message from ${session.name}`,
      body,
      audience: "admin",
      href: "/admin/client-projects",
    });
    setMsg("");
  };

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    const ats = await Promise.all(Array.from(files).map(async (f) => {
      try { return await fileToAttachment(f); } catch (e) { toast({ title: "Skipped", description: (e as Error).message, variant: "destructive" }); return null; }
    }));
    const valid = ats.filter(Boolean) as NonNullable<typeof ats[number]>[];
    // Attach to first non-done milestone as a "client upload" or new generic milestone bucket
    update((p) => {
      const target = p.milestones.find((m) => m.status !== "done");
      if (target) {
        return { ...p, milestones: p.milestones.map((m) => m.id === target.id ? { ...m, deliverables: [...(m.deliverables ?? []), ...valid] } : m) };
      }
      return { ...p, milestones: [...p.milestones, { id: uid(), title: "Client uploads", status: "in_progress", deliverables: valid }] };
    });
    toast({ title: "Uploaded", description: `${valid.length} file(s) sent to your studio.` });
  };

  const payInvoice = (invId: string) => {
    update((p) => ({
      ...p,
      invoices: p.invoices.map((i) => i.id === invId ? { ...i, status: "paid", paidAt: new Date().toISOString() } : i),
    }));
    const inv = project.invoices.find((i) => i.id === invId);
    realtime.publish({
      kind: "invoice",
      title: `Invoice ${inv?.number ?? ""} paid`,
      body: `${project.clientName} marked ${inv?.amount ?? ""} as paid.`,
      audience: "admin",
      href: "/admin/client-projects",
    });
    toast({ title: "Payment recorded", description: "This is a mock payment — no real charge made." });
  };

  const brand = { studioName: state.settings.brand.studioName, tagline: state.settings.brand.tagline, email: state.settings.contact.email };

  return (
    <>
      <Link to="/portal/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={14} /> All projects
      </Link>

      <div className="surface-card p-6">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${stageColor[project.stage]}`}>{stageLabel(project.stage)}</span>
          <span className="text-xs text-muted-foreground">Started {new Date(project.startedAt).toLocaleDateString()}</span>
        </div>
        <h1 className="font-display text-3xl font-bold mt-2">{project.title}</h1>

        <div className="mt-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Overall progress</span>
            <span>{milestoneProgress(project.milestones)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-primary transition-all" style={{ width: `${milestoneProgress(project.milestones)}%` }} />
          </div>
          <ol className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-5">
            {STAGES.map((s, i) => {
              const idx = STAGES.indexOf(project.stage);
              const reached = i <= idx;
              return (
                <li key={s} className={`text-center text-[10px] uppercase tracking-widest py-2 rounded-md border ${reached ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
                  {stageLabel(s)}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        {/* Milestones */}
        <div className="surface-card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Milestones</h2>
          <ul className="space-y-3">
            {project.milestones.map((m) => (
              <li key={m.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm">{m.title}</span>
                  <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-secondary border border-border">{m.status.replace("_", " ")}</span>
                </div>
                {m.description && <p className="text-xs text-muted-foreground mt-1">{m.description}</p>}
                {(m.deliverables ?? []).length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {m.deliverables!.map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-2 text-xs rounded-md bg-background border border-border px-2 py-1">
                        <span className="flex items-center gap-1.5 truncate"><FileText size={11} /> {a.name}</span>
                        <button onClick={() => downloadDataUrl(a.dataUrl, a.name)} className="text-muted-foreground hover:text-foreground"><Download size={12} /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => { onUpload(e.target.files); e.target.value = ""; }} />
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
              <Paperclip size={14} /> Upload files for the studio
            </Button>
          </div>
        </div>

        {/* Invoices */}
        <div className="surface-card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Invoices</h2>
          {project.invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {project.invoices.map((inv) => (
                <li key={inv.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="font-medium text-sm">{inv.number} — {inv.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(inv.createdAt).toLocaleDateString()}
                      {inv.paidAt && ` · paid ${new Date(inv.paidAt).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{inv.amount}</span>
                    {inv.status === "paid" ? (
                      <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500 text-white">paid</span>
                    ) : (
                      <Button size="sm" variant="hero" onClick={() => payInvoice(inv.id)}>
                        <CheckCircle2 size={14} /> Pay invoice
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[11px] text-muted-foreground mt-3">Payments are simulated — no real charges occur.</p>
        </div>
      </div>

      {/* Messages */}
      <div className="surface-card p-6 mt-5">
        <h2 className="font-display text-lg font-semibold mb-4">Messages</h2>
        <ul className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {project.messages.map((m) => (
            <li key={m.id} className={`flex ${m.authorRole === "client" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${m.authorRole === "client" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                <div className="text-[10px] uppercase tracking-widest opacity-70 mb-1">{m.authorName}</div>
                <div className="whitespace-pre-wrap">{m.body}</div>
                <div className="text-[10px] opacity-60 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
              </div>
            </li>
          ))}
          {project.messages.length === 0 && <li className="text-sm text-muted-foreground">No messages yet.</li>}
        </ul>
        <div className="flex gap-2 mt-4">
          <Textarea rows={2} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Message your studio..." />
          <Button onClick={sendMessage} variant="hero" className="self-end"><Send size={14} /> Send</Button>
        </div>
      </div>
    </>
  );
};

export default PortalProjectDetail;
