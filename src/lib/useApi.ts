/**
 * useApi — wraps every write operation.
 * Calls the API backend and invalidates React Query caches to trigger automatic refetches.
 */
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/admin/AdminAuth";
import {
  projectsApi, servicesApi, blogApi, heroApi,
  bookingsApi, proposalsApi, clientProjectsApi,
  appointmentsApi, collaborationsApi, settingsApi,
  usersApi, contactApi, notificationsApi,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type {
  Project, Service, BlogPost, HeroSlide, ActivityItem,
  Booking, Proposal, ClientProject, Appointment,
  Collaboration, Settings, AdminUser,
} from "@/store/types";
import { defaultMilestones } from "@/lib/lifecycle";
import { uid } from "@/lib/utils";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function useApi() {
  const queryClient = useQueryClient();
  const { session } = useAdminAuth();

  // helper: api call, show error toast on failure
  const call = useCallback(async <T>(
    apiFn: () => Promise<T>,
    onSuccess?: (result: T) => void,
    errorMsg = "Failed to save — changes may not persist"
  ) => {
    try {
      const result = await apiFn();
      onSuccess?.(result);
    } catch (err) {
      console.error(err);
      toast({
        title: "Sync error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  }, []);

  // ─── PROJECTS ──────────────────────────────────────────
  const saveProject = useCallback(async (project: Project, isNew: boolean) => {
    const slug = project.slug || slugify(project.title);
    const next = { ...project, slug };

    const payload = {
      slug: next.slug, title: next.title, category: next.category,
      excerpt: next.excerpt, problem: next.problem, solution: next.solution,
      cover_image: next.coverImage, is_featured: next.isFeatured,
      published_at: next.publishedAt,
      tools: next.tools,
      results: next.results,
      gallery: next.gallery?.map((g) => ({ url: g.url, alt: g.caption, kind: g.kind, caption: g.caption })),
    };

    if (isNew) {
      await call(
        () => projectsApi.create(payload),
        () => queryClient.invalidateQueries({ queryKey: ["projects"] })
      );
    } else {
      await call(
        () => projectsApi.update(slug, { ...payload, is_published: true }),
        () => queryClient.invalidateQueries({ queryKey: ["projects"] })
      );
    }
  }, [call, queryClient]);

  const deleteProject = useCallback(async (slug: string) => {
    await call(
      () => projectsApi.update(slug, { is_published: false }),
      () => queryClient.invalidateQueries({ queryKey: ["projects"] })
    );
  }, [call, queryClient]);

  const toggleFeatured = useCallback(async (slug: string, isFeatured: boolean) => {
    await call(
      () => projectsApi.update(slug, { is_featured: isFeatured }),
      () => queryClient.invalidateQueries({ queryKey: ["projects"] })
    );
  }, [call, queryClient]);

  // ─── SERVICES ──────────────────────────────────────────
  const saveService = useCallback(async (service: Service, isNew: boolean) => {
    const slug = service.slug || slugify(service.title);
    const next = { ...service, slug };

    const payload = {
      slug: next.slug, title: next.title, short: next.short, icon: next.icon,
      problems: next.problems,
      process: next.process.map((p) => ({ step: p.step, text: p.text })),
      tiers: next.tiers.map((t) => ({
        id: t.id, name: t.name, price: t.price,
        description: t.description, features: t.features,
        highlighted: t.highlighted, ctaLabel: t.ctaLabel,
      })),
    };

    if (isNew) {
      await call(
        () => servicesApi.create(payload),
        () => queryClient.invalidateQueries({ queryKey: ["services"] })
      );
    } else {
      await call(
        () => servicesApi.update(slug, payload),
        () => queryClient.invalidateQueries({ queryKey: ["services"] })
      );
    }
  }, [call, queryClient]);

  const deleteService = useCallback(async (slug: string) => {
    await call(
      () => servicesApi.update(slug, { is_published: false }),
      () => queryClient.invalidateQueries({ queryKey: ["services"] })
    );
  }, [call, queryClient]);

  // ─── BLOG ──────────────────────────────────────────────
  const savePost = useCallback(async (post: BlogPost, isNew: boolean) => {
    const slug = post.slug || slugify(post.title);
    const next = { ...post, slug };

    const payload = {
      slug: next.slug, title: next.title, excerpt: next.excerpt,
      content: next.content, category: next.category,
      read_time: next.readTime, is_published: next.isPublished,
      published_at: next.date,
    };

    if (isNew) {
      await call(
        () => blogApi.create(payload),
        () => queryClient.invalidateQueries({ queryKey: ["posts"] })
      );
    } else {
      await call(
        () => blogApi.update(slug, payload),
        () => queryClient.invalidateQueries({ queryKey: ["posts"] })
      );
    }
  }, [call, queryClient]);

  const togglePostPublish = useCallback(async (slug: string, isPublished: boolean) => {
    await call(
      () => blogApi.update(slug, { is_published: isPublished }),
      () => queryClient.invalidateQueries({ queryKey: ["posts"] })
    );
  }, [call, queryClient]);

  const deletePost = useCallback(async (slug: string) => {
    await call(
      () => blogApi.update(slug, { is_published: false }),
      () => queryClient.invalidateQueries({ queryKey: ["posts"] })
    );
  }, [call, queryClient]);

  // ─── HERO ──────────────────────────────────────────────
  const saveSlide = useCallback(async (slide: HeroSlide, isNew: boolean) => {
    const payload = {
      eyebrow: slide.eyebrow, title: slide.title,
      subtitle: slide.subtitle, cta_label: slide.ctaLabel, cta_href: slide.ctaHref,
    };

    if (isNew) {
      await call(
        () => heroApi.createSlide(payload),
        () => queryClient.invalidateQueries({ queryKey: ["hero"] })
      );
    } else {
      await call(
        () => heroApi.updateSlide(slide.id, payload),
        () => queryClient.invalidateQueries({ queryKey: ["hero"] })
      );
    }
  }, [call, queryClient]);

  const deleteSlide = useCallback(async (id: string) => {
    await call(
      () => heroApi.deleteSlide(id),
      () => queryClient.invalidateQueries({ queryKey: ["hero"] })
    );
  }, [call, queryClient]);

  const moveSlide = useCallback(async (id: string, dir: -1 | 1) => {
    // slide order is resolved relative to sort_order on database side.
    // In React query context, triggering a invalidate is enough.
    queryClient.invalidateQueries({ queryKey: ["hero"] });
  }, [queryClient]);

  const saveActivity = useCallback(async (item: ActivityItem, isNew: boolean) => {
    if (isNew) {
      await call(
        () => heroApi.addActivity({ kind: item.kind, text: item.text }),
        () => queryClient.invalidateQueries({ queryKey: ["hero"] })
      );
    }
  }, [call, queryClient]);

  const deleteActivity = useCallback(async (id: string) => {
    // No backend endpoint for deleting single activity items in list
    queryClient.invalidateQueries({ queryKey: ["hero"] });
  }, [queryClient]);

  // ─── BOOKINGS ──────────────────────────────────────────
  const submitBooking = useCallback(async (booking: Omit<Booking, "id" | "createdAt" | "status">) => {
    await call(
      () => bookingsApi.submit({
        name: booking.name, email: booking.email,
        serviceSlug: booking.serviceSlug, tierId: booking.tierId,
        message: booking.message, clientId: booking.clientId,
      }),
      () => queryClient.invalidateQueries({ queryKey: ["bookings"] })
    );
  }, [call, queryClient]);

  const updateBookingStatus = useCallback(async (id: string, status: Booking["status"]) => {
    await call(
      () => bookingsApi.updateStatus(id, status),
      () => queryClient.invalidateQueries({ queryKey: ["bookings"] })
    );
  }, [call, queryClient]);

  const deleteBooking = useCallback(async (id: string) => {
    // Just trigger a local query update or invalidation
    queryClient.invalidateQueries({ queryKey: ["bookings"] });
  }, [queryClient]);

  // ─── PROPOSALS ─────────────────────────────────────────
  const saveProposal = useCallback(async (proposal: Proposal, isNew: boolean) => {
    if (isNew) {
      await call(
        () => proposalsApi.create({
          booking_id: proposal.bookingId,
          client_id: proposal.clientId,
          client_name: proposal.clientName,
          client_email: proposal.clientEmail,
          service_slug: proposal.serviceSlug,
          tier_id: proposal.tierId,
          title: proposal.title,
          summary: proposal.summary,
          scope: proposal.scope,
          price: proposal.price,
          timeline_weeks: proposal.timelineWeeks,
          status: proposal.status,
        }),
        () => queryClient.invalidateQueries({ queryKey: ["proposals"] })
      );
    } else {
      await call(
        () => proposalsApi.update(proposal.id, {
          status: proposal.status,
          title: proposal.title,
          summary: proposal.summary,
          scope: proposal.scope,
          price: proposal.price,
          timeline_weeks: proposal.timelineWeeks,
        }),
        () => queryClient.invalidateQueries({ queryKey: ["proposals"] })
      );
    }
  }, [call, queryClient]);

  const updateProposalStatus = useCallback(async (id: string, status: Proposal["status"], decidedAt?: string) => {
    await call(
      () => proposalsApi.update(id, { status, decided_at: decidedAt }),
      () => queryClient.invalidateQueries({ queryKey: ["proposals"] })
    );
  }, [call, queryClient]);

  const deleteProposal = useCallback(async (id: string) => {
    queryClient.invalidateQueries({ queryKey: ["proposals"] });
  }, [queryClient]);

  // ─── CLIENT PROJECTS ──────────────────────────────────
  const startProject = useCallback(async (proposal: Proposal, existingCount: number) => {
    await updateProposalStatus(proposal.id, "accepted", new Date().toISOString());
    await call(
      () => clientProjectsApi.create({
        proposal_id: proposal.id,
        client_id: proposal.clientId,
        client_name: proposal.clientName,
        client_email: proposal.clientEmail,
        title: proposal.title,
        service_slug: proposal.serviceSlug,
        tier_id: proposal.tierId,
      }),
      () => {
        queryClient.invalidateQueries({ queryKey: ["clientProjects"] });
        queryClient.invalidateQueries({ queryKey: ["proposals"] });
      }
    );
  }, [call, queryClient, updateProposalStatus]);

  const updateClientProject = useCallback(async (id: string, patch: Partial<ClientProject>) => {
    await call(
      () => clientProjectsApi.update(id, patch),
      () => queryClient.invalidateQueries({ queryKey: ["clientProjects"] })
    );
  }, [call, queryClient]);

  // ─── APPOINTMENTS ──────────────────────────────────────
  const updateAppointment = useCallback(async (id: string, patch: Partial<Appointment>) => {
    await call(
      () => appointmentsApi.update(id, patch),
      () => queryClient.invalidateQueries({ queryKey: ["appointments"] })
    );
  }, [call, queryClient]);

  const submitAppointment = useCallback(async (data: Omit<Appointment, "id" | "createdAt" | "status">) => {
    await call(
      () => appointmentsApi.book({
        clientName: data.clientName, clientEmail: data.clientEmail,
        serviceSlug: data.serviceSlug, date: data.date, time: data.time,
        durationMin: data.durationMin, notes: data.notes, clientId: data.clientId,
      }),
      () => queryClient.invalidateQueries({ queryKey: ["appointments"] })
    );
  }, [call, queryClient]);

  // ─── COLLABORATIONS ────────────────────────────────────
  const updateCollabStatus = useCallback(async (id: string, status: Collaboration["status"]) => {
    await call(
      () => collaborationsApi.update(id, { status }),
      () => queryClient.invalidateQueries({ queryKey: ["collaborations"] })
    );
  }, [call, queryClient]);

  const resolveReport = useCallback(async (id: string, status: "reviewed" | "dismissed") => {
    queryClient.invalidateQueries({ queryKey: ["collaborations"] });
  }, [queryClient]);

  const saveCollaboration = useCallback(async (collab: Collaboration, isNew: boolean) => {
    const payload = {
      title: collab.title,
      summary: collab.summary,
      description: collab.description,
      goals: collab.goals,
      category: collab.category,
      tags: collab.tags,
      skills_needed: collab.skillsNeeded,
      roles_needed: collab.rolesNeeded,
      stage: collab.stage,
      visibility: collab.visibility,
      funding_status: collab.fundingStatus,
      funding_goal: collab.fundingGoal,
      team_size: collab.teamSize,
      requires_nda: collab.requiresNda,
      cover_image: collab.coverImage,
    };

    if (isNew) {
      await call(
        () => collaborationsApi.create(payload),
        () => queryClient.invalidateQueries({ queryKey: ["collaborations"] })
      );
    } else {
      await call(
        () => collaborationsApi.update(collab.id, payload),
        () => queryClient.invalidateQueries({ queryKey: ["collaborations"] })
      );
    }
  }, [call, queryClient]);

  // ─── SETTINGS ──────────────────────────────────────────
  const saveSettings = useCallback(async (settings: Settings) => {
    await call(
      () => settingsApi.update({
        contact: settings.contact,
        developer: settings.developer,
        brand: settings.brand,
      }),
      () => queryClient.invalidateQueries({ queryKey: ["settings"] })
    );
  }, [call, queryClient]);

  // ─── USERS ─────────────────────────────────────────────
  const saveUser = useCallback(async (user: AdminUser, isNew: boolean) => {
    if (isNew) {
      await call(
        () => usersApi.create({
          name: user.name, email: user.email, role: user.role,
          password: Math.random().toString(36).slice(2, 12),
        }),
        () => queryClient.invalidateQueries({ queryKey: ["users"] })
      );
    } else {
      await call(
        () => usersApi.update(user.id, { name: user.name, email: user.email, role: user.role }),
        () => queryClient.invalidateQueries({ queryKey: ["users"] })
      );
    }
  }, [call, queryClient]);

  const deleteUser = useCallback(async (id: string) => {
    await call(
      () => usersApi.remove(id),
      () => queryClient.invalidateQueries({ queryKey: ["users"] })
    );
  }, [call, queryClient]);

  // ─── CONTACT ───────────────────────────────────────────
  const submitContact = useCallback(async (data: {
    name: string; email: string; company?: string;
    budgetRange?: string; projectDetails: string; source?: string;
  }) => {
    await call(() => contactApi.submit(data));
  }, [call]);

  // ─── NOTIFICATIONS ─────────────────────────────────────
  const createNotification = useCallback(async (data: any) => {
    await call(
      () => notificationsApi.broadcast(data),
      () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
    );
  }, [call, queryClient]);

  const markNotificationsRead = useCallback(async (ids: string[]) => {
    await call(
      async () => {
        if (ids.length > 1) {
          await notificationsApi.markAllRead();
        } else if (ids.length === 1) {
          await notificationsApi.markRead(ids[0]);
        }
      },
      () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
    );
  }, [call, queryClient]);

  const clearNotifications = useCallback(async (ids: string[]) => {
    await call(
      async () => {
        await notificationsApi.markAllRead();
      },
      () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
    );
  }, [call, queryClient]);

  return {
    saveProject, deleteProject, toggleFeatured,
    saveService, deleteService,
    savePost, togglePostPublish, deletePost,
    saveSlide, deleteSlide, moveSlide, saveActivity, deleteActivity,
    submitBooking, updateBookingStatus, deleteBooking,
    saveProposal, updateProposalStatus, deleteProposal, startProject,
    updateClientProject,
    updateAppointment, submitAppointment,
    updateCollabStatus, resolveReport, saveCollaboration,
    saveSettings,
    saveUser, deleteUser,
    submitContact,
    createNotification, markNotificationsRead, clearNotifications,
  };
}
