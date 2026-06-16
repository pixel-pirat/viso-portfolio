/**
 * useApi — wraps every write operation.
 * Calls the real API backend AND updates local StudioStore state
 * so the UI stays instantly reactive without waiting for a refetch.
 */
import { useCallback } from "react";
import { useStudio, uid } from "@/store/StudioStore";
import { useAdminAuth } from "@/admin/AdminAuth";
import {
  projectsApi, servicesApi, blogApi, heroApi,
  bookingsApi, proposalsApi, clientProjectsApi,
  appointmentsApi, collaborationsApi, settingsApi,
  usersApi, notificationsApi, contactApi,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type {
  Project, Service, BlogPost, HeroSlide, ActivityItem,
  Booking, Proposal, ClientProject, Appointment,
  Collaboration, Settings, AdminUser,
} from "@/store/types";
import { defaultMilestones } from "@/lib/lifecycle";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function useApi() {
  const { setState } = useStudio();
  const { session } = useAdminAuth();

  // ─── helper: fire-and-forget API call, show error toast on failure ───
  const call = useCallback(async <T>(
    apiFn: () => Promise<T>,
    onSuccess?: (result: T) => void,
    errorMsg = "Failed to save — changes may not persist across devices"
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

  // ════════════════════════════════════════════════════════
  // PROJECTS
  // ════════════════════════════════════════════════════════
  const saveProject = useCallback(async (project: Project, isNew: boolean) => {
    const slug = project.slug || slugify(project.title);
    const next = { ...project, slug };

    // Optimistic local update
    setState((s) => {
      const exists = s.projects.find((p) => p.slug === slug);
      return {
        ...s,
        projects: exists
          ? s.projects.map((p) => p.slug === slug ? next : p)
          : [next, ...s.projects],
      };
    });

    // API call
    if (isNew) {
      await call(() => projectsApi.create({
        slug: next.slug, title: next.title, category: next.category,
        excerpt: next.excerpt, problem: next.problem, solution: next.solution,
        cover_image: next.coverImage, is_featured: next.isFeatured,
        published_at: next.publishedAt,
        tools: next.tools,
        results: next.results,
        gallery: next.gallery?.map((g) => ({ url: g.url, alt: g.caption, kind: g.kind, caption: g.caption })),
      }));
    } else {
      // Find by slug to get DB id — we store slug as identifier
      await call(() => projectsApi.update(slug, {
        title: next.title, category: next.category,
        excerpt: next.excerpt, problem: next.problem, solution: next.solution,
        cover_image: next.coverImage, is_featured: next.isFeatured,
        is_published: true, published_at: next.publishedAt,
        tools: next.tools, results: next.results,
        gallery: next.gallery?.map((g) => ({ url: g.url, alt: g.caption, kind: g.kind, caption: g.caption })),
      }));
    }
  }, [setState, call]);

  const deleteProject = useCallback(async (slug: string) => {
    setState((s) => ({ ...s, projects: s.projects.filter((p) => p.slug !== slug) }));
    await call(() => projectsApi.update(slug, { is_published: false }));
  }, [setState, call]);

  const toggleFeatured = useCallback(async (slug: string, isFeatured: boolean) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((p) => p.slug === slug ? { ...p, isFeatured } : p),
    }));
    await call(() => projectsApi.update(slug, { is_featured: isFeatured }));
  }, [setState, call]);

  // ════════════════════════════════════════════════════════
  // SERVICES
  // ════════════════════════════════════════════════════════
  const saveService = useCallback(async (service: Service, isNew: boolean) => {
    const slug = service.slug || slugify(service.title);
    const next = { ...service, slug };

    setState((s) => {
      const exists = s.services.find((x) => x.slug === slug);
      return {
        ...s,
        services: exists
          ? s.services.map((x) => x.slug === slug ? next : x)
          : [...s.services, next],
      };
    });

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
      await call(() => servicesApi.create(payload));
    } else {
      await call(() => servicesApi.update(slug, payload));
    }
  }, [setState, call]);

  const deleteService = useCallback(async (slug: string) => {
    setState((s) => ({ ...s, services: s.services.filter((x) => x.slug !== slug) }));
    await call(() => servicesApi.update(slug, { is_published: false }));
  }, [setState, call]);

  // ════════════════════════════════════════════════════════
  // BLOG
  // ════════════════════════════════════════════════════════
  const savePost = useCallback(async (post: BlogPost, isNew: boolean) => {
    const slug = post.slug || slugify(post.title);
    const next = { ...post, slug };

    setState((s) => {
      const exists = s.posts.find((x) => x.slug === slug);
      return {
        ...s,
        posts: exists
          ? s.posts.map((x) => x.slug === slug ? next : x)
          : [next, ...s.posts],
      };
    });

    const payload = {
      slug: next.slug, title: next.title, excerpt: next.excerpt,
      content: next.content, category: next.category,
      read_time: next.readTime, is_published: next.isPublished,
      published_at: next.date,
    };

    if (isNew) {
      await call(() => blogApi.create(payload));
    } else {
      await call(() => blogApi.update(slug, payload));
    }
  }, [setState, call]);

  const togglePostPublish = useCallback(async (slug: string, isPublished: boolean) => {
    setState((s) => ({
      ...s,
      posts: s.posts.map((p) => p.slug === slug ? { ...p, isPublished } : p),
    }));
    await call(() => blogApi.update(slug, { is_published: isPublished }));
  }, [setState, call]);

  const deletePost = useCallback(async (slug: string) => {
    setState((s) => ({ ...s, posts: s.posts.filter((p) => p.slug !== slug) }));
    await call(() => blogApi.update(slug, { is_published: false }));
  }, [setState, call]);

  // ════════════════════════════════════════════════════════
  // HERO
  // ════════════════════════════════════════════════════════
  const saveSlide = useCallback(async (slide: HeroSlide, isNew: boolean) => {
    setState((s) => {
      const exists = s.hero.slides.find((x) => x.id === slide.id);
      return {
        ...s,
        hero: {
          ...s.hero,
          slides: exists
            ? s.hero.slides.map((x) => x.id === slide.id ? slide : x)
            : [...s.hero.slides, slide],
        },
      };
    });

    const payload = {
      eyebrow: slide.eyebrow, title: slide.title,
      subtitle: slide.subtitle, cta_label: slide.ctaLabel, cta_href: slide.ctaHref,
    };

    if (isNew) {
      await call(() => heroApi.createSlide(payload));
    } else {
      await call(() => heroApi.updateSlide(slide.id, payload));
    }
  }, [setState, call]);

  const deleteSlide = useCallback(async (id: string) => {
    setState((s) => ({ ...s, hero: { ...s.hero, slides: s.hero.slides.filter((x) => x.id !== id) } }));
    await call(() => heroApi.deleteSlide(id));
  }, [setState, call]);

  const moveSlide = useCallback((id: string, dir: -1 | 1) => {
    setState((s) => {
      const slides = [...s.hero.slides];
      const i = slides.findIndex((x) => x.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= slides.length) return s;
      [slides[i], slides[j]] = [slides[j], slides[i]];
      return { ...s, hero: { ...s.hero, slides } };
    });
    // Order is managed locally; no API order endpoint needed
  }, [setState]);

  const saveActivity = useCallback(async (item: ActivityItem, isNew: boolean) => {
    setState((s) => {
      const exists = s.hero.activity.find((x) => x.id === item.id);
      return {
        ...s,
        hero: {
          ...s.hero,
          activity: exists
            ? s.hero.activity.map((x) => x.id === item.id ? item : x)
            : [item, ...s.hero.activity],
        },
      };
    });

    if (isNew) {
      await call(() => heroApi.addActivity({ kind: item.kind, text: item.text }));
    }
  }, [setState, call]);

  const deleteActivity = useCallback((id: string) => {
    setState((s) => ({ ...s, hero: { ...s.hero, activity: s.hero.activity.filter((x) => x.id !== id) } }));
  }, [setState]);

  // ════════════════════════════════════════════════════════
  // BOOKINGS
  // ════════════════════════════════════════════════════════
  const submitBooking = useCallback(async (booking: Omit<Booking, "id" | "createdAt" | "status">) => {
    const newBooking: Booking = {
      id: uid(), ...booking, status: "new", createdAt: new Date().toISOString(),
    };

    setState((s) => ({ ...s, bookings: [newBooking, ...s.bookings] }));

    await call(() => bookingsApi.submit({
      name: booking.name, email: booking.email,
      serviceSlug: booking.serviceSlug, tierId: booking.tierId,
      message: booking.message, clientId: booking.clientId,
    }));
  }, [setState, call]);

  const updateBookingStatus = useCallback(async (id: string, status: Booking["status"]) => {
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) => b.id === id ? { ...b, status } : b),
    }));
    await call(() => bookingsApi.updateStatus(id, status));
  }, [setState, call]);

  const deleteBooking = useCallback(async (id: string) => {
    setState((s) => ({ ...s, bookings: s.bookings.filter((b) => b.id !== id) }));
    // No delete endpoint needed — just remove from local state
  }, [setState]);

  // ════════════════════════════════════════════════════════
  // PROPOSALS
  // ════════════════════════════════════════════════════════
  const saveProposal = useCallback(async (proposal: Proposal, isNew: boolean) => {
    setState((s) => {
      const exists = s.proposals.find((p) => p.id === proposal.id);
      return {
        ...s,
        proposals: exists
          ? s.proposals.map((p) => p.id === proposal.id ? proposal : p)
          : [proposal, ...s.proposals],
      };
    });

    if (isNew) {
      await call(() => proposalsApi.create({
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
      }));
    } else {
      await call(() => proposalsApi.update(proposal.id, {
        status: proposal.status,
        title: proposal.title,
        summary: proposal.summary,
        scope: proposal.scope,
        price: proposal.price,
        timeline_weeks: proposal.timelineWeeks,
      }));
    }
  }, [setState, call]);

  const updateProposalStatus = useCallback(async (id: string, status: Proposal["status"], decidedAt?: string) => {
    setState((s) => ({
      ...s,
      proposals: s.proposals.map((p) => p.id === id ? { ...p, status, decidedAt } : p),
    }));
    await call(() => proposalsApi.update(id, { status, decided_at: decidedAt }));
  }, [setState, call]);

  const deleteProposal = useCallback((id: string) => {
    setState((s) => ({ ...s, proposals: s.proposals.filter((p) => p.id !== id) }));
  }, [setState]);

  // ════════════════════════════════════════════════════════
  // CLIENT PROJECTS (start from proposal)
  // ════════════════════════════════════════════════════════
  const startProject = useCallback(async (proposal: Proposal, existingCount: number) => {
    const cp: ClientProject = {
      id: uid(),
      proposalId: proposal.id,
      clientId: proposal.clientId,
      clientName: proposal.clientName,
      clientEmail: proposal.clientEmail,
      title: proposal.title,
      serviceSlug: proposal.serviceSlug,
      tierId: proposal.tierId,
      stage: "kickoff",
      progress: 5,
      startedAt: new Date().toISOString(),
      milestones: defaultMilestones(),
      messages: [{
        id: uid(),
        authorId: "admin",
        authorName: "Studio",
        authorRole: "admin",
        body: `Welcome aboard! Kicking off ${proposal.title}. We'll reach out shortly with the kickoff agenda.`,
        createdAt: new Date().toISOString(),
      }],
      invoices: [{
        id: uid(),
        number: `INV-${String(existingCount + 1).padStart(3, "0")}`,
        description: `Deposit — ${proposal.title}`,
        amount: proposal.price,
        status: "sent",
        createdAt: new Date().toISOString(),
      }],
    };

    setState((s) => ({ ...s, clientProjects: [cp, ...s.clientProjects] }));
    await updateProposalStatus(proposal.id, "accepted", new Date().toISOString());

    await call(() => clientProjectsApi.create({
      proposal_id: proposal.id,
      client_id: proposal.clientId,
      client_name: proposal.clientName,
      client_email: proposal.clientEmail,
      title: proposal.title,
      service_slug: proposal.serviceSlug,
      tier_id: proposal.tierId,
    }));
  }, [setState, call, updateProposalStatus]);

  const updateClientProject = useCallback(async (id: string, patch: Partial<ClientProject>) => {
    setState((s) => ({
      ...s,
      clientProjects: s.clientProjects.map((cp) => cp.id === id ? { ...cp, ...patch } : cp),
    }));
    await call(() => clientProjectsApi.update(id, patch));
  }, [setState, call]);

  // ════════════════════════════════════════════════════════
  // APPOINTMENTS
  // ════════════════════════════════════════════════════════
  const updateAppointment = useCallback(async (id: string, patch: Partial<Appointment>) => {
    setState((s) => ({
      ...s,
      appointments: s.appointments.map((a) => a.id === id ? { ...a, ...patch } : a),
    }));
    await call(() => appointmentsApi.update(id, patch));
  }, [setState, call]);

  const submitAppointment = useCallback(async (data: Omit<Appointment, "id" | "createdAt" | "status">) => {
    const appt: Appointment = {
      id: uid(), ...data, status: "pending", createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, appointments: [appt, ...s.appointments] }));
    await call(() => appointmentsApi.book({
      clientName: data.clientName, clientEmail: data.clientEmail,
      serviceSlug: data.serviceSlug, date: data.date, time: data.time,
      durationMin: data.durationMin, notes: data.notes, clientId: data.clientId,
    }));
  }, [setState, call]);

  // ════════════════════════════════════════════════════════
  // COLLABORATIONS
  // ════════════════════════════════════════════════════════
  const updateCollabStatus = useCallback(async (id: string, status: Collaboration["status"]) => {
    setState((s) => ({
      ...s,
      collaborations: s.collaborations.map((c) => c.id === id ? { ...c, status } : c),
    }));
    await call(() => collaborationsApi.update(id, { status }));
  }, [setState, call]);

  const resolveReport = useCallback(async (id: string, status: "reviewed" | "dismissed") => {
    setState((s) => ({
      ...s,
      collaborationReports: s.collaborationReports.map((r) => r.id === id ? { ...r, status } : r),
    }));
  }, [setState]);

  // ════════════════════════════════════════════════════════
  // SETTINGS
  // ════════════════════════════════════════════════════════
  const saveSettings = useCallback(async (settings: Settings) => {
    setState((s) => ({ ...s, settings }));
    await call(() => settingsApi.update({
      contact: settings.contact,
      developer: settings.developer,
      brand: settings.brand,
    }));
  }, [setState, call]);

  // ════════════════════════════════════════════════════════
  // USERS
  // ════════════════════════════════════════════════════════
  const saveUser = useCallback(async (user: AdminUser, isNew: boolean) => {
    setState((s) => {
      const exists = s.users.find((u) => u.id === user.id);
      return {
        ...s,
        users: exists
          ? s.users.map((u) => u.id === user.id ? user : u)
          : [...s.users, user],
      };
    });

    if (isNew) {
      await call(() => usersApi.create({
        name: user.name, email: user.email, role: user.role,
        password: Math.random().toString(36).slice(2, 12),
      }));
    } else {
      await call(() => usersApi.update(user.id, { name: user.name, email: user.email, role: user.role }));
    }
  }, [setState, call]);

  const deleteUser = useCallback(async (id: string) => {
    setState((s) => ({ ...s, users: s.users.filter((u) => u.id !== id) }));
    await call(() => usersApi.remove(id));
  }, [setState, call]);

  // ════════════════════════════════════════════════════════
  // CONTACT
  // ════════════════════════════════════════════════════════
  const submitContact = useCallback(async (data: {
    name: string; email: string; company?: string;
    budgetRange?: string; projectDetails: string; source?: string;
  }) => {
    await call(() => contactApi.submit(data));
  }, [call]);

  return {
    // Projects
    saveProject, deleteProject, toggleFeatured,
    // Services
    saveService, deleteService,
    // Blog
    savePost, togglePostPublish, deletePost,
    // Hero
    saveSlide, deleteSlide, moveSlide, saveActivity, deleteActivity,
    // Bookings
    submitBooking, updateBookingStatus, deleteBooking,
    // Proposals
    saveProposal, updateProposalStatus, deleteProposal, startProject,
    // Client projects
    updateClientProject,
    // Appointments
    updateAppointment, submitAppointment,
    // Collaborations
    updateCollabStatus, resolveReport,
    // Settings
    saveSettings,
    // Users
    saveUser, deleteUser,
    // Contact
    submitContact,
  };
}
