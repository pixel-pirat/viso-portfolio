import { Link } from "react-router-dom";
import { PageHeader, EmptyState } from "@/admin/components/AdminUI";
import { useMyData } from "./PortalDashboard";
import { stageColor, stageLabel, milestoneProgress } from "@/lib/lifecycle";

const PortalProjects = () => {
  const { projects } = useMyData();

  if (projects.length === 0) {
    return (
      <>
        <PageHeader title="My projects" />
        <EmptyState title="No active projects" description="Once a proposal is accepted and started, your project will appear here." />
      </>
    );
  }

  return (
    <>
      <PageHeader title="My projects" description="Track every engagement with your studio." />
      <div className="grid sm:grid-cols-2 gap-4">
        {projects.map((p) => (
          <Link
            key={p.id}
            to={`/portal/projects/${p.id}`}
            className="surface-card p-5 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${stageColor[p.stage]}`}>{stageLabel(p.stage)}</span>
              <span className="text-xs text-muted-foreground">Started {new Date(p.startedAt).toLocaleDateString()}</span>
            </div>
            <h3 className="font-display text-lg font-semibold mt-3">{p.title}</h3>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Progress</span>
                <span>{milestoneProgress(p.milestones)}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-gradient-primary" style={{ width: `${milestoneProgress(p.milestones)}%` }} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default PortalProjects;
