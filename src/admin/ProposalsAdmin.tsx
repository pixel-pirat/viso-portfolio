import { useState } from "react";
import { useProposals, useClientProjects, useSettings } from "@/lib/useData";
import { useApi } from "@/lib/useApi";
import { PageHeader, EmptyState } from "./components/AdminUI";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Send, CheckCircle2, XCircle, Rocket, FileDown, Loader2 } from "lucide-react";
import CreateProposalDialog from "./CreateProposalDialog";
import { proposalStatusColor } from "@/lib/lifecycle";
import type { Proposal } from "@/store/types";
import { toast } from "@/hooks/use-toast";
import { exportProposalPdf } from "@/lib/pdf";

const ProposalsAdmin = () => {
  const { data: proposals = [], isLoading } = useProposals("all");
  const { data: clientProjects = [] } = useClientProjects("all");
  const { data: settings } = useSettings();
  const { updateProposalStatus, deleteProposal, startProject } = useApi();
  const [open, setOpen] = useState(false);

  const update = (id: string, patch: Partial<Proposal>) => {
    updateProposalStatus(id, patch.status as Proposal["status"], patch.decidedAt);
    if (patch.status === "sent") {
      const p = (proposals as any[]).find((x) => x.id === id);
      if (p) {
        import("@/lib/realtime").then(({ realtime }) => realtime.publish({
          kind: "proposal", title: "New proposal received",
          body: p.title, audience: p.clientId, href: "/portal/proposals",
        }));
      }
    }
  };

  const remove = (id: string) => deleteProposal(id);

  const handleStartProject = (p: Proposal) => {
    startProject(p, (clientProjects as any[]).length);
    toast({ title: "Project started", description: `${p.clientName} now has access in their portal.` });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Proposals"
        description="Send pricing proposals to clients. When accepted, convert into an active project."
        actions={<Button variant="hero" onClick={() => setOpen(true)}><Plus size={14} /> New proposal</Button>}
      />

      {(proposals as any[]).length === 0 ? (
        <EmptyState
          title="No proposals yet"
          description="Create a proposal manually, or convert a booking from the Bookings page."
          action={<Button variant="hero" onClick={() => setOpen(true)}><Plus size={14} /> New proposal</Button>}
        />
      ) : (
        <div className="space-y-3">
          {(proposals as any[]).map((p) => (
            <div key={p.id} className="surface-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${proposalStatusColor[p.status as Proposal["status"]]}`}>{p.status}</span>
                    <span className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold mt-2">{p.title}</h3>
                  <div className="text-sm text-muted-foreground">
                    {p.clientName} · {p.clientEmail} — <span className="text-foreground">{p.price}</span> · {p.timelineWeeks} weeks
                  </div>
                  <p className="text-sm mt-2 max-w-2xl">{p.summary}</p>
                  {p.scope?.length > 0 && (
                    <ul className="mt-3 text-sm grid sm:grid-cols-2 gap-1.5 max-w-2xl">
                      {p.scope.map((s: string, i: number) => (
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
                  {p.status === "accepted" && !(clientProjects as any[]).some((cp: any) => cp.proposalId === p.id) && (
                    <Button size="sm" variant="hero" onClick={() => handleStartProject(p)}>
                      <Rocket size={14} /> Start project
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => exportProposalPdf(p, {
                      studioName: settings?.brand?.studioName ?? "",
                      legalName: settings?.brand?.legalName,
                      tagline: settings?.brand?.tagline ?? "",
                      email: settings?.contact?.email ?? "",
                    })}
                  >
                    <FileDown size={14} /> Export PDF
                  </Button>
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
