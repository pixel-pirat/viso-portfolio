import type {
  ClientProject, ClientProjectStage, Milestone, Proposal, Service, ServiceTier,
} from "@/store/types";

export const STAGES: ClientProjectStage[] = [
  "kickoff", "discovery", "design", "development", "review", "delivered",
];

export const stageLabel = (s: ClientProjectStage) =>
  s.charAt(0).toUpperCase() + s.slice(1);

export const stageProgress = (s: ClientProjectStage) => {
  const idx = STAGES.indexOf(s);
  return Math.round(((idx + 1) / STAGES.length) * 100);
};

export const milestoneProgress = (ms: Milestone[]) => {
  if (!ms.length) return 0;
  const done = ms.filter((m) => m.status === "done").length;
  return Math.round((done / ms.length) * 100);
};

export const defaultMilestones = (): Milestone[] => [
  { id: rid(), title: "Kickoff & brief", status: "done" },
  { id: rid(), title: "Discovery & strategy", status: "in_progress" },
  { id: rid(), title: "Design exploration", status: "pending" },
  { id: rid(), title: "Build & integrate", status: "pending" },
  { id: rid(), title: "Review & QA", status: "pending" },
  { id: rid(), title: "Launch & handoff", status: "pending" },
];

const rid = () => Math.random().toString(36).slice(2, 10);

export const buildProposalFromTier = (
  service: Service, tier: ServiceTier,
): Pick<Proposal, "title" | "summary" | "scope" | "price" | "timelineWeeks"> => ({
  title: `${service.title} — ${tier.name}`,
  summary: tier.description,
  scope: tier.features,
  price: tier.price,
  timelineWeeks: 6,
});

export const proposalStatusColor: Record<Proposal["status"], string> = {
  draft: "bg-secondary text-foreground border border-border",
  sent: "bg-primary text-primary-foreground",
  accepted: "bg-emerald-500 text-white",
  declined: "bg-destructive text-destructive-foreground",
};

export const stageColor: Record<ClientProjectStage, string> = {
  kickoff: "bg-secondary text-foreground border border-border",
  discovery: "bg-accent-purple text-accent-purple-foreground",
  design: "bg-primary text-primary-foreground",
  development: "bg-primary text-primary-foreground",
  review: "bg-amber-500 text-white",
  delivered: "bg-emerald-500 text-white",
};
