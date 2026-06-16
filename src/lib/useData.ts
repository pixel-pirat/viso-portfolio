/**
 * useData — react-query hooks that fetch from the API.
 * These are the single source of truth for business data across public, client, and admin pages.
 */
import { useQuery } from "@tanstack/react-query";
import {
  servicesApi, projectsApi, blogApi, heroApi, settingsApi, collaborationsApi,
  bookingsApi, proposalsApi, clientProjectsApi, appointmentsApi, notificationsApi, usersApi
} from "@/lib/api";

const STALE = 30_000; // 30 seconds fresh time

// ─── Field normalizer ─────────────────────────────────────
// API returns snake_case from PostgreSQL — normalize to camelCase for frontend
function normalizeProject(p: any) {
  return {
    ...p,
    coverImage: p.coverImage ?? p.cover_image ?? undefined,
    isFeatured: p.isFeatured ?? p.is_featured ?? false,
    isPublished: p.isPublished ?? p.is_published ?? true,
    publishedAt: p.publishedAt ?? p.published_at ?? "",
    tools: p.tools ?? [],
    results: p.results ?? [],
    gallery: p.gallery ?? [],
  };
}

function normalizePost(p: any) {
  return {
    ...p,
    isPublished: p.isPublished ?? p.is_published ?? true,
    readTime: p.readTime ?? p.read_time ?? "5 min",
    date: p.date ?? p.published_at ?? "",
    content: Array.isArray(p.content)
      ? p.content
      : (typeof p.content === "string" ? JSON.parse(p.content || "[]") : []),
  };
}

function normalizeService(s: any) {
  return {
    ...s,
    problems: s.problems ?? [],
    process: s.process ?? [],
    tiers: (s.tiers ?? []).map((t: any) => ({
      ...t,
      id: t.id ?? t.tier_key,
      ctaLabel: t.ctaLabel ?? t.cta_label,
      features: Array.isArray(t.features)
        ? t.features
        : (typeof t.features === "string" ? JSON.parse(t.features || "[]") : []),
    })),
  };
}

// ─── Services ────────────────────────────────────────────
export function useServices(isAdmin = false) {
  return useQuery({
    queryKey: ["services", { isAdmin }],
    queryFn: async () => {
      const data = await (isAdmin ? servicesApi.listAll() : servicesApi.list()) as any[];
      return data.map(normalizeService);
    },
    staleTime: STALE,
  });
}

export function useService(slug: string) {
  return useQuery({
    queryKey: ["services", slug],
    queryFn: async () => normalizeService(await servicesApi.get(slug) as any),
    staleTime: STALE,
    enabled: !!slug,
  });
}

// ─── Projects ────────────────────────────────────────────
export function useProjects(params?: { category?: string; featured?: boolean }, isAdmin = false) {
  return useQuery({
    queryKey: ["projects", params, { isAdmin }],
    queryFn: async () => {
      const data = await (isAdmin ? projectsApi.listAll() : projectsApi.list(params)) as any[];
      return data.map(normalizeProject);
    },
    staleTime: STALE,
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ["projects", slug],
    queryFn: async () => normalizeProject(await projectsApi.get(slug) as any),
    staleTime: STALE,
    enabled: !!slug,
  });
}

// ─── Blog ─────────────────────────────────────────────────
export function usePosts(category?: string, isAdmin = false) {
  return useQuery({
    queryKey: ["posts", category, { isAdmin }],
    queryFn: async () => {
      const data = await (isAdmin ? blogApi.listAll() : blogApi.list(category)) as any[];
      return data.map(normalizePost);
    },
    staleTime: STALE,
  });
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: ["posts", slug],
    queryFn: async () => normalizePost(await blogApi.get(slug) as any),
    staleTime: STALE,
    enabled: !!slug,
  });
}

// ─── Hero ─────────────────────────────────────────────────
export function useHero() {
  return useQuery({
    queryKey: ["hero"],
    queryFn: () => heroApi.get() as Promise<{ slides: any[]; activity: any[] }>,
    staleTime: STALE,
  });
}

// ─── Settings ─────────────────────────────────────────────
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get() as Promise<any>,
    staleTime: STALE,
  });
}

// ─── Collaborations ───────────────────────────────────────
export function useCollaborations(params?: { category?: string; stage?: string }, scope: "all" | "mine" | "public" = "public") {
  return useQuery({
    queryKey: ["collaborations", params, { scope }],
    queryFn: (): Promise<any[]> => {
      if (scope === "all") return collaborationsApi.listAll() as Promise<any[]>;
      if (scope === "mine") return collaborationsApi.mine() as Promise<any[]>;
      return collaborationsApi.list(params) as Promise<any[]>;
    },
    staleTime: STALE,
  });
}

export function useCollaboration(id: string) {
  return useQuery({
    queryKey: ["collaborations", id],
    queryFn: () => collaborationsApi.get(id) as Promise<any>,
    staleTime: STALE,
    enabled: !!id,
  });
}

export function useCollabMyRequests(id: string) {
  return useQuery({
    queryKey: ["collaborations", id, "my-requests"],
    queryFn: () => collaborationsApi.getMyRequests(id) as Promise<any[]>,
    staleTime: STALE,
    enabled: !!id,
  });
}

// ─── Bookings ─────────────────────────────────────────────
export function useBookings(scope: "all" | "mine" = "all") {
  return useQuery({
    queryKey: ["bookings", { scope }],
    queryFn: () => (scope === "all" ? bookingsApi.list() : bookingsApi.mine()) as Promise<any[]>,
    staleTime: STALE,
  });
}

// ─── Proposals ────────────────────────────────────────────
export function useProposals(scope: "all" | "mine" = "all") {
  return useQuery({
    queryKey: ["proposals", { scope }],
    queryFn: () => (scope === "all" ? proposalsApi.list() : proposalsApi.mine()) as Promise<any[]>,
    staleTime: STALE,
  });
}

// ─── Client Projects ──────────────────────────────────────
export function useClientProjects(scope: "all" | "mine" = "all") {
  return useQuery({
    queryKey: ["clientProjects", { scope }],
    queryFn: () => (scope === "all" ? clientProjectsApi.list() : clientProjectsApi.mine()) as Promise<any[]>,
    staleTime: STALE,
  });
}

// ─── Appointments ─────────────────────────────────────────
export function useAppointments(scope: "all" | "mine" = "all") {
  return useQuery({
    queryKey: ["appointments", { scope }],
    queryFn: () => (scope === "all" ? appointmentsApi.list() : appointmentsApi.mine()) as Promise<any[]>,
    staleTime: STALE,
  });
}

// ─── Notifications ────────────────────────────────────────
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list() as Promise<any[]>,
    staleTime: STALE,
  });
}

// ─── Users (admin only) ───────────────────────────────────
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.list() as Promise<any[]>,
    staleTime: STALE,
  });
}
