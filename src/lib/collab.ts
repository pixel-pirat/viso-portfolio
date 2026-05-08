import type {
  Collaboration,
  CollaborationRequest,
  CollaborationUpdate,
  CollabConsent,
  StudioState,
} from "@/store/types";
import { uid } from "@/store/StudioStore";

export const COLLAB_CONSENT_VERSION = "2026-05-01";

export const CATEGORIES = [
  "SaaS", "Mobile Apps", "AI/ML", "FinTech",
  "Media & Content", "Creative Projects", "E-commerce",
  "Social Platforms", "Other",
] as const;

export const STAGES = [
  { value: "idea", label: "Idea" },
  { value: "validating", label: "Validating" },
  { value: "building", label: "Building" },
  { value: "launched", label: "Launched" },
  { value: "scaling", label: "Scaling" },
] as const;

export const ROLES_NEEDED = [
  { value: "co-founder", label: "Co-founder" },
  { value: "developer", label: "Developer" },
  { value: "designer", label: "Designer" },
  { value: "investor", label: "Investor" },
  { value: "contributor", label: "Contributor" },
  { value: "advisor", label: "Advisor" },
] as const;

export const VISIBILITY = [
  { value: "public", label: "Public" },
  { value: "invite_only", label: "Invite-only" },
  { value: "private_preview", label: "Private preview" },
] as const;

export const FUNDING_STATUSES = [
  { value: "n/a", label: "N/A" },
  { value: "self_funded", label: "Self-funded" },
  { value: "seeking", label: "Seeking funding" },
  { value: "funded", label: "Funded" },
] as const;

export function hasConsent(state: StudioState, userId?: string | null): boolean {
  if (!userId) return false;
  return state.collabConsents.some(
    (c) => c.userId === userId && c.version === COLLAB_CONSENT_VERSION,
  );
}

export function recordConsent(userId: string): CollabConsent {
  return { userId, acceptedAt: new Date().toISOString(), version: COLLAB_CONSENT_VERSION };
}

export function revokeConsent(state: StudioState, userId: string): StudioState {
  return { ...state, collabConsents: state.collabConsents.filter((c) => c.userId !== userId) };
}

export function isVisibleTo(c: Collaboration, userId?: string | null): boolean {
  if (c.status !== "active") return false;
  if (c.visibility === "public") return true;
  if (!userId) return false;
  if (c.ownerId === userId) return true;
  // invite_only / private_preview visible only to owner or accepted contributors (mock: owner only)
  return false;
}

export function newCollaboration(input: Partial<Collaboration> & {
  ownerId: string; ownerName: string; ownerEmail: string; title: string;
}): Collaboration {
  const now = new Date().toISOString();
  return {
    id: uid(),
    ownerId: input.ownerId,
    ownerName: input.ownerName,
    ownerEmail: input.ownerEmail,
    title: input.title,
    summary: input.summary ?? "",
    description: input.description ?? "",
    goals: input.goals ?? "",
    category: (input.category as Collaboration["category"]) ?? "Other",
    tags: input.tags ?? [],
    skillsNeeded: input.skillsNeeded ?? [],
    rolesNeeded: input.rolesNeeded ?? [],
    stage: input.stage ?? "idea",
    visibility: input.visibility ?? "public",
    fundingStatus: input.fundingStatus ?? "n/a",
    fundingGoal: input.fundingGoal,
    teamSize: input.teamSize ?? 1,
    requiresNda: input.requiresNda ?? false,
    attachments: input.attachments,
    coverImage: input.coverImage,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
}

export function newRequest(
  collabId: string,
  user: { id: string; name: string; email: string },
  kind: CollaborationRequest["kind"],
  message: string,
  role?: CollaborationRequest["role"],
): CollaborationRequest {
  return {
    id: uid(),
    collaborationId: collabId,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    kind,
    role,
    message,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}

export function newUpdate(
  collabId: string,
  author: { id: string; name: string; role: "founder" | "contributor" | "visitor" },
  kind: CollaborationUpdate["kind"],
  body: string,
): CollaborationUpdate {
  return {
    id: uid(),
    collaborationId: collabId,
    authorId: author.id,
    authorName: author.name,
    authorRole: author.role,
    kind,
    body,
    createdAt: new Date().toISOString(),
  };
}

export const stageLabel = (s: Collaboration["stage"]) =>
  STAGES.find((x) => x.value === s)?.label ?? s;
export const visibilityLabel = (v: Collaboration["visibility"]) =>
  VISIBILITY.find((x) => x.value === v)?.label ?? v;
export const fundingLabel = (f: Collaboration["fundingStatus"]) =>
  FUNDING_STATUSES.find((x) => x.value === f)?.label ?? f;
