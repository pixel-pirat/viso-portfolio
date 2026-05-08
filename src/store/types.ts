export type ServiceTier = {
  id: string;
  name: string;        // e.g. "Starter", "Pro", "Premium"
  price: string;       // "$2,500" or "from $5k"
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaLabel?: string;
};

export type Service = {
  slug: string;
  title: string;
  short: string;
  icon: string;        // lucide icon name
  problems: string[];
  process: { step: string; text: string }[];
  tiers: ServiceTier[];
};

export type MediaItem = {
  id: string;
  kind: "image" | "video";
  url: string;          // data URL (image) or external URL (video placeholder)
  caption?: string;
};

export type Project = {
  slug: string;
  title: string;
  category: "Web" | "Mobile" | "Branding" | "Media";
  excerpt: string;
  problem: string;
  solution: string;
  tools: string[];
  results: { metric: string; label: string }[];
  isFeatured?: boolean;
  publishedAt: string; // ISO
  coverImage?: string; // base64 data URL or remote URL
  gallery?: MediaItem[];
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: "Design" | "Engineering" | "Branding" | "Process";
  readTime: string;
  content: string[];
  isPublished: boolean;
};

export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
};

export type ActivityItem = {
  id: string;
  kind: "project" | "blog" | "service" | "note";
  text: string;
  timestamp: string; // ISO
};

export type Attachment = {
  id: string;
  name: string;
  type: string;     // mime
  size: number;     // bytes
  dataUrl: string;  // base64 data URL (mock storage)
};

export type Booking = {
  id: string;
  name: string;
  email: string;
  serviceSlug: string;
  tierId: string;
  message: string;
  status: "new" | "in_review" | "replied" | "won" | "lost";
  createdAt: string;
  attachments?: Attachment[];
  /** Client account id, set when a logged-in client books. */
  clientId?: string;
};

export type ProposalStatus = "draft" | "sent" | "accepted" | "declined";

export type Proposal = {
  id: string;
  bookingId?: string;       // optional source booking
  clientId: string;         // account id of the recipient
  clientName: string;
  clientEmail: string;
  serviceSlug: string;
  tierId: string;
  title: string;
  summary: string;
  scope: string[];          // bullet items
  price: string;            // display string, e.g. "$6,500"
  timelineWeeks: number;
  status: ProposalStatus;
  createdAt: string;
  decidedAt?: string;
};

export type MilestoneStatus = "pending" | "in_progress" | "review" | "done";

export type Milestone = {
  id: string;
  title: string;
  description?: string;
  status: MilestoneStatus;
  dueDate?: string;        // ISO date
  deliverables?: Attachment[];
};

export type ClientProjectStage =
  | "kickoff"
  | "discovery"
  | "design"
  | "development"
  | "review"
  | "delivered";

export type Message = {
  id: string;
  authorId: string;        // account id ("admin" sentinel for legacy admin)
  authorName: string;
  authorRole: "admin" | "client";
  body: string;
  createdAt: string;
};

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export type InvoiceReminder = {
  id: string;
  sentAt: string;
  channel: "manual" | "auto";
  note?: string;
};

export type Invoice = {
  id: string;
  number: string;          // e.g. "INV-001"
  description: string;
  amount: string;          // display string
  status: InvoiceStatus;
  createdAt: string;
  paidAt?: string;
  milestoneId?: string;
  dueDate?: string;        // ISO date — used for reminder logic
  reminders?: InvoiceReminder[];
};

export type ClientProject = {
  id: string;
  proposalId?: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  title: string;
  serviceSlug: string;
  tierId: string;
  stage: ClientProjectStage;
  progress: number;        // 0..100
  startedAt: string;
  milestones: Milestone[];
  messages: Message[];
  invoices: Invoice[];
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  createdAt: string;
};

export type Settings = {
  contact: {
    email: string;
    location: string;
    socials: { twitter: string; instagram: string; linkedin: string; github: string };
  };
  developer: {
    name: string;
    title: string;
    bio: string;
    avatarUrl: string;
    yearsExperience: number;
    location: string;
  };
  brand: {
    studioName: string;
    tagline: string;
  };
};

export type AppointmentStatus = "pending" | "confirmed" | "declined" | "completed" | "cancelled";

export type Appointment = {
  id: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  serviceSlug?: string;
  date: string;            // ISO date (YYYY-MM-DD)
  time: string;            // HH:mm
  durationMin: number;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
};

export type NotificationKind =
  | "message"
  | "proposal"
  | "invoice"
  | "project_update"
  | "appointment"
  | "reminder";

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  href?: string;
  /** Account id of the recipient. "admin" = any admin. */
  audience: "admin" | string;
  createdAt: string;
  read: boolean;
};

export type CollabCategory =
  | "SaaS" | "Mobile Apps" | "AI/ML" | "FinTech"
  | "Media & Content" | "Creative Projects" | "E-commerce"
  | "Social Platforms" | "Other";

export type CollabStage = "idea" | "validating" | "building" | "launched" | "scaling";
export type CollabVisibility = "public" | "invite_only" | "private_preview";
export type CollabRoleNeeded = "developer" | "designer" | "investor" | "contributor" | "advisor" | "co-founder";
export type CollabStatus = "active" | "flagged" | "removed";
export type CollabFundingStatus = "self_funded" | "seeking" | "funded" | "n/a";

export type CollabAttachment = Attachment;

export type Collaboration = {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  title: string;
  summary: string;
  description: string;
  goals: string;
  category: CollabCategory;
  tags: string[];
  skillsNeeded: string[];
  rolesNeeded: CollabRoleNeeded[];
  stage: CollabStage;
  visibility: CollabVisibility;
  fundingStatus: CollabFundingStatus;
  fundingGoal?: string;
  teamSize: number;
  requiresNda: boolean;
  attachments?: CollabAttachment[];
  coverImage?: string;
  status: CollabStatus;
  createdAt: string;
  updatedAt: string;
};

export type CollabRequestKind = "join" | "interest" | "investor" | "contact";
export type CollabRequestStatus = "pending" | "accepted" | "declined";

export type CollaborationRequest = {
  id: string;
  collaborationId: string;
  userId: string;
  userName: string;
  userEmail: string;
  kind: CollabRequestKind;
  role?: CollabRoleNeeded;
  message: string;
  status: CollabRequestStatus;
  createdAt: string;
};

export type CollabUpdateKind = "update" | "discussion" | "log";

export type CollaborationUpdate = {
  id: string;
  collaborationId: string;
  authorId: string;
  authorName: string;
  authorRole: "founder" | "contributor" | "visitor";
  kind: CollabUpdateKind;
  body: string;
  createdAt: string;
};

export type CollaborationReport = {
  id: string;
  collaborationId: string;
  reporterId: string;
  reporterName: string;
  reason: "plagiarism" | "abuse" | "spam" | "ip_violation" | "other";
  details: string;
  status: "open" | "reviewed" | "dismissed";
  createdAt: string;
};

export type CollabConsent = {
  userId: string;
  acceptedAt: string;
  version: string;
};

export type StudioState = {
  services: Service[];
  projects: Project[];
  posts: BlogPost[];
  hero: { slides: HeroSlide[]; activity: ActivityItem[] };
  bookings: Booking[];
  users: AdminUser[];
  settings: Settings;
  proposals: Proposal[];
  clientProjects: ClientProject[];
  appointments: Appointment[];
  notifications: NotificationItem[];
  collaborations: Collaboration[];
  collaborationRequests: CollaborationRequest[];
  collaborationUpdates: CollaborationUpdate[];
  collaborationReports: CollaborationReport[];
  collabConsents: CollabConsent[];
};
