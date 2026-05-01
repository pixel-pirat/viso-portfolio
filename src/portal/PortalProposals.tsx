import { useStudio } from "@/store/StudioStore";
import { useAdminAuth } from "@/admin/AdminAuth";
import { PageHeader, EmptyState } from "@/admin/components/AdminUI";
import { Button } from "@/components/ui/button";
import { proposalStatusColor } from "@/lib/lifecycle";
import { useMyData } from "./PortalDashboard";
import { toast } from "@/hooks/use-toast";

const PortalProposals = () => {
  const { setState } = useStudio();
  const { proposals } = useMyData();

  const decide = (id: string, status: "accepted" | "declined") => {
    setState((s) => ({
      ...s,
      proposals: s.proposals.map((p) => p.id === id ? { ...p, status, decidedAt: new Date().toISOString() } : p),
    }));
    toast({ title: status === "accepted" ? "Proposal accepted" : "Proposal declined", description: status === "accepted" ? "Your studio will start the project shortly." : "Thanks for letting us know." });
  };

  if (proposals.length === 0) {
    return (
      <>
        <PageHeader title="Proposals" />
        <EmptyState title="No proposals yet" description="When your studio sends a proposal, you'll find it here." />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Proposals" description="Review the scope, price, and timeline — then accept or decline." />
      <div className="space-y-4">
        {proposals.map((p) => (
          <div key={p.id} className="surface-card p-6">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${proposalStatusColor[p.status]}`}>{p.status}</span>
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
                <div className="font-display text-lg font-bold mt-1">{p.scope.length}</div>
              </div>
            </div>

            {p.scope.length > 0 && (
              <ul className="mt-5 grid sm:grid-cols-2 gap-1.5 text-sm">
                {p.scope.map((s, i) => <li key={i} className="flex gap-2"><span className="text-primary">✓</span>{s}</li>)}
              </ul>
            )}

            {p.status === "sent" && (
              <div className="flex gap-2 mt-6">
                <Button variant="hero" onClick={() => decide(p.id, "accepted")}>Accept proposal</Button>
                <Button variant="ghost" className="text-destructive" onClick={() => decide(p.id, "declined")}>Decline</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default PortalProposals;
