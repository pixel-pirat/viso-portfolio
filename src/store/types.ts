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

export type InvoiceStatus = "draft" | "sent" | "paid";

export type Invoice = {
  id: string;
  number: string;          // e.g. "INV-001"
  description: string;
  amount: string;          // display string
  status: InvoiceStatus;
  createdAt: string;
  paidAt?: string;
  milestoneId?: string;
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
};
