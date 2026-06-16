/**
 * useData — react-query hooks that fetch from the API.
 * These replace direct useStudio() reads on public-facing pages.
 * Admin pages that need write access still use useStudio() + useApi().
 */
import { useQuery } from "@tanstack/react-query";
import {
  servicesApi, projectsApi, blogApi, heroApi, settingsApi, collaborationsApi,
} from "@/lib/api";
import { useStudio } from "@/store/StudioStore";

// Stale time — data is considered fresh for 60 seconds
const STALE = 60_000;

// ─── Services ────────────────────────────────────────────
export function useServices() {
  const { state } = useStudio();
  return useQuery({
    queryKey: ["services"],
    queryFn: () => servicesApi.list() as Promise<typeof state.services>,
    staleTime: STALE,
    initialData: state.services.length > 0 ? state.services : undefined,
  });
}

export function useService(slug: string) {
  const { state } = useStudio();
  const local = state.services.find((s) => s.slug === slug);
  return useQuery({
    queryKey: ["services", slug],
    queryFn: () => servicesApi.get(slug) as Promise<(typeof state.services)[0]>,
    staleTime: STALE,
    initialData: local,
    enabled: !!slug,
  });
}

// ─── Projects ────────────────────────────────────────────
export function useProjects(params?: { category?: string; featured?: boolean }) {
  const { state } = useStudio();
  return useQuery({
    queryKey: ["projects", params],
    queryFn: () => projectsApi.list(params) as Promise<typeof state.projects>,
    staleTime: STALE,
    initialData: state.projects.length > 0 ? state.projects : undefined,
  });
}

export function useProject(slug: string) {
  const { state } = useStudio();
  const local = state.projects.find((p) => p.slug === slug);
  return useQuery({
    queryKey: ["projects", slug],
    queryFn: () => projectsApi.get(slug) as Promise<(typeof state.projects)[0]>,
    staleTime: STALE,
    initialData: local,
    enabled: !!slug,
  });
}

// ─── Blog ─────────────────────────────────────────────────
export function usePosts(category?: string) {
  const { state } = useStudio();
  return useQuery({
    queryKey: ["posts", category],
    queryFn: () => blogApi.list(category) as Promise<typeof state.posts>,
    staleTime: STALE,
    initialData: state.posts.length > 0 ? state.posts : undefined,
  });
}

export function usePost(slug: string) {
  const { state } = useStudio();
  const local = state.posts.find((p) => p.slug === slug);
  return useQuery({
    queryKey: ["posts", slug],
    queryFn: () => blogApi.get(slug) as Promise<(typeof state.posts)[0]>,
    staleTime: STALE,
    initialData: local,
    enabled: !!slug,
  });
}

// ─── Hero ─────────────────────────────────────────────────
export function useHero() {
  const { state } = useStudio();
  return useQuery({
    queryKey: ["hero"],
    queryFn: () => heroApi.get() as Promise<{ slides: typeof state.hero.slides; activity: typeof state.hero.activity }>,
    staleTime: STALE,
    initialData: state.hero.slides.length > 0 ? state.hero : undefined,
  });
}

// ─── Settings ─────────────────────────────────────────────
export function useSettings() {
  const { state } = useStudio();
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get() as Promise<typeof state.settings>,
    staleTime: STALE,
    initialData: state.settings,
  });
}

// ─── Collaborations ───────────────────────────────────────
export function useCollaborations(params?: { category?: string; stage?: string }) {
  const { state } = useStudio();
  return useQuery({
    queryKey: ["collaborations", params],
    queryFn: () => collaborationsApi.list(params) as Promise<typeof state.collaborations>,
    staleTime: STALE,
    initialData: state.collaborations.length > 0 ? state.collaborations : undefined,
  });
}

export function useCollaboration(id: string) {
  const { state } = useStudio();
  const local = state.collaborations.find((c) => c.id === id);
  return useQuery({
    queryKey: ["collaborations", id],
    queryFn: () => collaborationsApi.get(id) as Promise<(typeof state.collaborations)[0]>,
    staleTime: STALE,
    initialData: local,
    enabled: !!id,
  });
}
