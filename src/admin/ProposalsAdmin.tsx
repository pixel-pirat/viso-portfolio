import { useState } from "react";
import { useStudio, uid } from "@/store/StudioStore";
import { PageHeader, EmptyState } from "./components/AdminUI";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Send, CheckCircle2, XCircle, Rocket, FileDown } from "lucide-react";
import CreateProposalDialog from "./CreateProposalDialog";
import { proposalStatusColor, defaultMilestones } from "@/lib/lifecycle";
import type { ClientProject, Proposal } from "@/store/types";
import { toast } from "@/hooks/use-toast";
import { realtime } from "@/lib/realtime";
import { exportProposalPdf } from "@/lib/pdf";

const ProposalsAdmin = () => {
  const { state, setState } = useStudio();
  const [open, setOpen] = useState(false);

  const update = (id: string, patch: Partial<Proposal>) => {
    setState((s) => ({ ...s, proposals: s.proposals.map((p) => p.id === id ? { ...p, ...patch } : p) }));
    if (patch.status === "sent") {
      const p = state.proposals.find((x) => x.id === id);
      if (p) {
        realtime.publish({
          kind: "proposal",
          title: "New proposal received",
          body: p.title,
          audience: p.clientId,
          href: "/portal/proposals",
        });
      }
    }
  };

  const remove = (id: string) =>
    setState((s) => ({ ...s, proposals: s.proposals.filter((p) => p.id !== id) }));

  const startProject = (p: Proposal) => {
    const cp: ClientProject = {
      id: uid(),
      proposalId: p.id,
      clientId: p.clientId,
      clientName: p.clientName,
      clientEmail: p.clientEmail,
      title: p.title,
      serviceSlug: p.serviceSlug,
      tierId: p.tierId,
      stage: "kickoff",
      progress: 5,
      startedAt: new Date().toISOString(),
      milestones: defaultMilestones(),
      messages: [{
        id: uid(),
        authorId: "admin",
        authorName: "Studio",
        authorRole: "admin",
        body: `Welcome aboard! Kicking off ${p.title}. We'll reach out shortly with the kickoff agenda.`,
        createdAt: new Date().toISOString(),
      }],
      invoices: [{
        id: uid(),
        number: `INV-${String(state.clientProjects.length + 1).padStart(3, "0")}`,
        description: `Deposit — ${p.title}`,
        amount: p.price,
        status: "sent",
        createdAt: new Date().toISOString(),
      }],
    };
    setState((s) => ({ ...s, clientProjects: [cp, ...s.clientProjects] }));
    update(p.id, { status: "accepted", decidedAt: new Date().toISOString() });
    toast({ title: "Project started", description: `${p.clientName} now has access in their portal.` });
  };

  return (
    <>
      <PageHeader
        title="Proposals"
        description="Send pricing proposals to clients. When accepted, convert into an active project."
        actions={<Button variant="hero" onClick={() => setOpen(true)}><Plus size={14} /> New proposal</Button>}
      />

      {state.proposals.length === 0 ? (
        <EmptyState
          title="No proposals yet"
          description="Create a proposal manually, or convert a booking from the Bookings page."
          action={<Button variant="hero" onClick={() => setOpen(true)}><Plus size={14} /> New proposal</Button>}
        />
      ) : (
        <div className="space-y-3">
          {state.proposals.map((p) => (
            <div key={p.id} className="surface-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${proposalStatusColor[p.status]}`}>{p.status}</span>
                    <span className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold mt-2">{p.title}</h3>
                  <div className="text-sm text-muted-foreground">
                    {p.clientName} · {p.clientEmail} — <span className="text-foreground">{p.price}</span> · {p.timelineWeeks} weeks
                  </div>
                  <p className="text-sm mt-2 max-w-2xl">{p.summary}</p>
                  {p.scope.length > 0 && (
                    <ul className="mt-3 text-sm grid sm:grid-cols-2 gap-1.5 max-w-2xl">
                      {p.scope.map((s, i) => (
                        <li key={i} className="flex gap-2"><span className="text-primary">✓</span>{s}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {p.status === "draft" && (
                    <Button size="sm" variant="outline" onClick={() => update(p.id, { status: "sent" })}>
                      <Send size={14} /> Mark sent
                    </Button>
                  )}
                  {p.status === "sent" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => update(p.id, { status: "accepted", decidedAt: new Date().toISOString() })}>
                        <CheckCircle2 size={14} /> Mark accepted
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive justify-start" onClick={() => update(p.id, { status: "declined", decidedAt: new Date().toISOString() })}>
                        <XCircle size={14} /> Mark declined
                      </Button>
                    </>
                  )}
                  {p.status === "accepted" && !state.clientProjects.some((cp) => cp.proposalId === p.id) && (
                    <Button size="sm" variant="hero" onClick={() => startProject(p)}>
                      <Rocket size={14} /> Start project
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-destructive justify-start" onClick={() => remove(p.id)}>
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateProposalDialog open={open} onOpenChange={setOpen} />
    </>
  );
};

export default ProposalsAdmin;
