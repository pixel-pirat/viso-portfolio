import { useStudio } from "@/store/StudioStore";
import { useAdminAuth } from "@/admin/AdminAuth";
import { PageHeader, StatCard, EmptyState } from "@/admin/components/AdminUI";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { stageColor, milestoneProgress } from "@/lib/lifecycle";

export const useMyData = () => {
  const { state } = useStudio();
  const { session } = useAdminAuth();
  const email = session?.email.toLowerCase() ?? "";
  const id = session?.id ?? "";

  const matches = (e?: string, cid?: string) =>
    (cid && cid === id) || (e && e.toLowerCase() === email);

  return {
    session,
    projects: state.clientProjects.filter((p) => matches(p.clientEmail, p.clientId)),
    proposals: state.proposals.filter((p) => matches(p.clientEmail, p.clientId)),
    bookings: state.bookings.filter((b) => matches(b.email, b.clientId)),
  };
};

const PortalDashboard = () => {
  const { session, projects, proposals, bookings } = useMyData();

  const activeProjects = projects.filter((p) => p.stage !== "delivered").length;
  const openProposals = proposals.filter((p) => p.status === "sent").length;
  const unpaid = projects.flatMap((p) => p.invoices).filter((i) => i.status !== "paid").length;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${session?.name?.split(" ")[0] ?? "there"}`}
        description="Here's a snapshot of everything happening with your work."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active projects" value={activeProjects} hint={`${projects.length} total`} />
        <StatCard label="Open proposals" value={openProposals} hint="awaiting your decision" />
        <StatCard label="Unpaid invoices" value={unpaid} />
        <StatCard label="Bookings" value={bookings.length} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-8">
        <div className="surface-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Your projects</h2>
            <Link to="/portal/projects" className="text-sm text-primary">View all →</Link>
          </div>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active projects yet.</p>
          ) : (
            <ul className="space-y-3">
              {projects.slice(0, 4).map((p) => (
                <li key={p.id}>
                  <Link to={`/portal/projects/${p.id}`} className="block rounded-lg border border-border p-3 hover:border-primary/40 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{p.title}</span>
                      <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full ${stageColor[p.stage]}`}>{p.stage}</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-primary" style={{ width: `${milestoneProgress(p.milestones)}%` }} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Proposals to review</h2>
            <Link to="/portal/proposals" className="text-sm text-primary">View all →</Link>
          </div>
          {proposals.filter((p) => p.status === "sent").length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing waiting on you.</p>
          ) : (
            <ul className="space-y-3">
              {proposals.filter((p) => p.status === "sent").slice(0, 4).map((p) => (
                <li key={p.id} className="rounded-lg border border-border p-3">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-sm text-muted-foreground">{p.price} · {p.timelineWeeks} weeks</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {projects.length === 0 && proposals.length === 0 && bookings.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="Nothing here yet"
            description="Book a service to get started — your studio will reach out and the work will appear here."
            action={<Button asChild variant="hero"><Link to="/services">Browse services</Link></Button>}
          />
        </div>
      )}
    </>
  );
};

export default PortalDashboard;
