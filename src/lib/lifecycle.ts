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

/* ----- Invoice reminder logic (mock scheduler) ----- */

import type { Invoice } from "@/store/types";

/** Days an invoice can be unpaid before being considered overdue. */
export const OVERDUE_AFTER_DAYS = 7;
/** Min days between automatic reminders. */
export const REMINDER_COOLDOWN_DAYS = 3;

export function isOverdue(inv: Invoice, now = Date.now()): boolean {
  if (inv.status === "paid" || inv.status === "draft") return false;
  const ref = inv.dueDate ? +new Date(inv.dueDate) : +new Date(inv.createdAt) + OVERDUE_AFTER_DAYS * 86_400_000;
  return now > ref;
}

export function daysSinceLastReminder(inv: Invoice, now = Date.now()): number | null {
  const last = inv.reminders?.[inv.reminders.length - 1];
  if (!last) return null;
  return Math.floor((now - +new Date(last.sentAt)) / 86_400_000);
}

export function shouldAutoRemind(inv: Invoice, now = Date.now()): boolean {
  if (!isOverdue(inv, now)) return false;
  const since = daysSinceLastReminder(inv, now);
  return since === null || since >= REMINDER_COOLDOWN_DAYS;
}

export const invoiceStatusColor: Record<Invoice["status"], string> = {
  draft: "bg-secondary text-foreground border border-border",
  sent: "bg-primary text-primary-foreground",
  paid: "bg-emerald-500 text-white",
  overdue: "bg-destructive text-destructive-foreground",
};
