import { useProposals, useSettings } from "@/lib/useData";
import { useApi } from "@/lib/useApi";
import { useAdminAuth } from "@/admin/AdminAuth";
import { PageHeader, EmptyState } from "@/admin/components/AdminUI";
import { Button } from "@/components/ui/button";
import { proposalStatusColor } from "@/lib/lifecycle";
import { toast } from "@/hooks/use-toast";
import { realtime } from "@/lib/realtime";
import { exportProposalPdf } from "@/lib/pdf";
import { FileDown, Loader2 } from "lucide-react";
import type { Proposal } from "@/store/types";

const PortalProposals = () => {
  const { data: proposals = [], isLoading } = useProposals("mine");
  const { data: settings } = useSettings();
  const { updateProposalStatus } = useApi();
  const { session } = useAdminAuth();

  const decide = (id: string, status: "accepted" | "declined") => {
    const p = (proposals as any[]).find((x) => x.id === id);
    updateProposalStatus(id, status, new Date().toISOString());
    if (p) {
      realtime.publish({
        kind: "proposal",
        title: `Proposal ${status}`,
        body: `${p.clientName} ${status} "${p.title}"`,
        audience: "admin",
        href: "/admin/proposals",
      });
    }
    toast({
      title: status === "accepted" ? "Proposal accepted" : "Proposal declined",
      description: status === "accepted" ? "Your studio will start the project shortly." : "Thanks for letting us know.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if ((proposals as any[]).length === 0) {
    return (
      <>
        <PageHeader title="Proposals" />
        <EmptyState title="No proposals yet" description="When your studio sends a proposal, you'll find it here." />
      </>
    );
  }

  const brand = {
    studioName: settings?.brand?.studioName ?? "",
    legalName: settings?.brand?.legalName,
    tagline: settings?.brand?.tagline ?? "",
    email: settings?.contact?.email ?? "",
  };

  return (
    <>
      <PageHeader title="Proposals" description="Review the scope, price, and timeline — then accept or decline." />
      <div className="space-y-4">
        {(proposals as any[]).map((p) => (
          <div key={p.id} className="surface-card p-6">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${proposalStatusColor[p.status as Proposal["status"]]}`}>{p.status}</span>
              <span className="text-xs text-muted-foreground">Sent {new Date(p.createdAt).toLocaleDateString()}</span>
            </div>
            <h3 className="font-display text-xl font-bold mt-2">{p.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{p.summary}</p>

            <div className="grid sm:grid-cols-3 gap-3 mt-5">
              <div className="rounded-lg border border-border p-3">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Price</div>
                <div className="font-display text-lg font-bold mt-1">{p.price}</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Timeline</div>
                <div className="font-display text-lg font-bold mt-1">{p.timelineWeeks} weeks</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Items</div>
                <div className="font-display text-lg font-bold mt-1">{p.scope?.length ?? 0}</div>
              </div>
            </div>

            {p.scope?.length > 0 && (
              <ul className="mt-5 grid sm:grid-cols-2 gap-1.5 text-sm">
                {p.scope.map((s: string, i: number) => <li key={i} className="flex gap-2"><span className="text-primary">✓</span>{s}</li>)}
              </ul>
            )}

            {p.status === "sent" && (
              <div className="flex gap-2 mt-6 flex-wrap">
                <Button variant="hero" onClick={() => decide(p.id, "accepted")}>Accept proposal</Button>
                <Button variant="ghost" className="text-destructive" onClick={() => decide(p.id, "declined")}>Decline</Button>
                <Button variant="outline" onClick={() => exportProposalPdf(p, brand)}>
                  <FileDown size={14} /> Download PDF
                </Button>
              </div>
            )}
            {p.status !== "sent" && (
              <div className="mt-6">
                <Button variant="outline" onClick={() => exportProposalPdf(p, brand)}>
                  <FileDown size={14} /> Download PDF
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default PortalProposals;
