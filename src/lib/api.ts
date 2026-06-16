/**
 * Centralized API client for the Digital Canvas Studio backend.
 * All communication with the Express/NeonDB API goes through here.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ─── Token management ────────────────────────────────────────
// Token is stored in secure HttpOnly cookies, so client-side localStorage is no longer used.
export function getToken(): string | null {
  return null;
}

export function setToken(token: string): void {
  /* no-op: cookie is set by server */
}

export function clearToken(): void {
  /* no-op: cookie is cleared by server */
}

// ─── Core fetch wrapper ──────────────────────────────────────
interface FetchOptions extends RequestInit {
  auth?: boolean;
}

async function apiFetch<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
  const { auth = true, headers: extraHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(extraHeaders as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${path}`, {
    headers,
    credentials: "include",
    ...rest,
  });

  if (res.status === 401) {
    clearToken();
    // Redirect to login if needed
    window.dispatchEvent(new CustomEvent("studio:unauthorized"));
  }

  if (!res.ok) {
    let errorMsg = `API error ${res.status}`;
    try {
      const body = await res.json();
      errorMsg = body.error || body.message || errorMsg;
    } catch {
      // ignore parse error
    }
    throw new Error(errorMsg);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

function get<T = unknown>(path: string, auth = false): Promise<T> {
  return apiFetch<T>(path, { method: "GET", auth });
}

function post<T = unknown>(path: string, body: unknown, auth = true): Promise<T> {
  return apiFetch<T>(path, { method: "POST", body: JSON.stringify(body), auth });
}

function patch<T = unknown>(path: string, body: unknown, auth = true): Promise<T> {
  return apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body), auth });
}

function del<T = unknown>(path: string, auth = true): Promise<T> {
  return apiFetch<T>(path, { method: "DELETE", auth });
}

// ─── Auth ────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    post<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
      "/api/auth/login",
      { email, password },
      false
    ),
  register: (name: string, email: string, password: string) =>
    post<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
      "/api/auth/register",
      { name, email, password },
      false
    ),
  me: () => get<{ id: string; name: string; email: string; role: string; avatar_url: string }>("/api/auth/me"),
  logout: () => post<{ success: boolean }>("/api/auth/logout", {}, false),
};

// ─── Services ────────────────────────────────────────────────
export const servicesApi = {
  list: () => get("/api/services", false),
  listAll: () => get("/api/services/all"),
  get: (slug: string) => get(`/api/services/${slug}`, false),
  create: (data: unknown) => post("/api/services", data),
  update: (id: string, data: unknown) => patch(`/api/services/${id}`, data),
  remove: (id: string) => del(`/api/services/${id}`),
};

// ─── Projects ────────────────────────────────────────────────
export const projectsApi = {
  list: (params?: { category?: string; featured?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set("category", params.category);
    if (params?.featured) qs.set("featured", "true");
    const q = qs.toString();
    return get(`/api/projects${q ? "?" + q : ""}`, false);
  },
  listAll: () => get("/api/projects/all"),
  get: (slug: string) => get(`/api/projects/${slug}`, false),
  create: (data: unknown) => post("/api/projects", data),
  update: (id: string, data: unknown) => patch(`/api/projects/${id}`, data),
  remove: (id: string) => del(`/api/projects/${id}`),
};

// ─── Blog ─────────────────────────────────────────────────────
export const blogApi = {
  list: (category?: string) => {
    const q = category ? `?category=${category}` : "";
    return get(`/api/blog${q}`, false);
  },
  listAll: () => get("/api/blog/all"),
  get: (slug: string) => get(`/api/blog/${slug}`, false),
  create: (data: unknown) => post("/api/blog", data),
  update: (id: string, data: unknown) => patch(`/api/blog/${id}`, data),
  remove: (id: string) => del(`/api/blog/${id}`),
};

// ─── Hero ─────────────────────────────────────────────────────
export const heroApi = {
  get: () => get("/api/hero", false),
  createSlide: (data: unknown) => post("/api/hero/slides", data),
  updateSlide: (id: string, data: unknown) => patch(`/api/hero/slides/${id}`, data),
  deleteSlide: (id: string) => del(`/api/hero/slides/${id}`),
  addActivity: (data: unknown) => post("/api/hero/activity", data),
};

// ─── Bookings ────────────────────────────────────────────────
export const bookingsApi = {
  submit: (data: unknown) => post("/api/bookings", data, false),
  list: (status?: string) => get(`/api/bookings${status ? "?status=" + status : ""}`),
  get: (id: string) => get(`/api/bookings/${id}`),
  updateStatus: (id: string, status: string) => patch(`/api/bookings/${id}`, { status }),
  mine: () => get("/api/bookings/mine"),
};

// ─── Proposals ───────────────────────────────────────────────
export const proposalsApi = {
  list: () => get("/api/proposals"),
  mine: () => get("/api/proposals/mine"),
  get: (id: string) => get(`/api/proposals/${id}`),
  create: (data: unknown) => post("/api/proposals", data),
  update: (id: string, data: unknown) => patch(`/api/proposals/${id}`, data),
};

// ─── Client Projects ─────────────────────────────────────────
export const clientProjectsApi = {
  list: () => get("/api/client-projects"),
  mine: () => get("/api/client-projects/mine"),
  get: (id: string) => get(`/api/client-projects/${id}`),
  create: (data: unknown) => post("/api/client-projects", data),
  update: (id: string, data: unknown) => patch(`/api/client-projects/${id}`, data),
  addMessage: (id: string, body: string) => post(`/api/client-projects/${id}/messages`, { body }),
  addMilestone: (id: string, data: unknown) => post(`/api/client-projects/${id}/milestones`, data),
  updateMilestone: (projectId: string, id: string, data: unknown) => patch(`/api/client-projects/${projectId}/milestones/${id}`, data),
  addInvoice: (id: string, data: unknown) => post(`/api/client-projects/${id}/invoices`, data),
  updateInvoice: (projectId: string, id: string, data: unknown) => patch(`/api/client-projects/${projectId}/invoices/${id}`, data),
};

// ─── Appointments ────────────────────────────────────────────
export const appointmentsApi = {
  book: (data: unknown) => post("/api/appointments", data, false),
  list: (params?: { status?: string; date?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.date) qs.set("date", params.date);
    const q = qs.toString();
    return get(`/api/appointments${q ? "?" + q : ""}`);
  },
  mine: () => get("/api/appointments/mine"),
  update: (id: string, data: unknown) => patch(`/api/appointments/${id}`, data),
  remove: (id: string) => del(`/api/appointments/${id}`),
};

// ─── Collaborations ──────────────────────────────────────────
export const collaborationsApi = {
  list: (params?: { category?: string; stage?: string }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set("category", params.category);
    if (params?.stage) qs.set("stage", params.stage);
    const q = qs.toString();
    return get(`/api/collaborations${q ? "?" + q : ""}`, false);
  },
  listAll: () => get("/api/collaborations/all"),
  mine: () => get("/api/collaborations/mine"),
  get: (id: string) => get(`/api/collaborations/${id}`, false),
  create: (data: unknown) => post("/api/collaborations", data),
  update: (id: string, data: unknown) => patch(`/api/collaborations/${id}`, data),
  request: (id: string, data: unknown) => post(`/api/collaborations/${id}/requests`, data),
  getRequests: (id: string) => get(`/api/collaborations/${id}/requests`),
  getMyRequests: (id: string) => get(`/api/collaborations/${id}/my-requests`),
  updateRequest: (id: string, rid: string, status: string) => patch(`/api/collaborations/${id}/requests/${rid}`, { status }),
  addUpdate: (id: string, data: unknown) => post(`/api/collaborations/${id}/updates`, data),
  report: (id: string, data: unknown) => post(`/api/collaborations/${id}/reports`, data),
  giveConsent: (version = "1.0") => post("/api/collaborations/consent", { version }),
};

// ─── Notifications ───────────────────────────────────────────
export const notificationsApi = {
  list: () => get("/api/notifications"),
  markRead: (id: string) => patch(`/api/notifications/${id}/read`, {}),
  markAllRead: () => post("/api/notifications/read-all", {}),
  broadcast: (data: unknown) => post("/api/notifications", data),
};

// ─── Settings ────────────────────────────────────────────────
export const settingsApi = {
  get: () => get("/api/settings", false),
  update: (data: unknown) => patch("/api/settings", data),
};

// ─── Contact ─────────────────────────────────────────────────
export const contactApi = {
  submit: (data: unknown) => post("/api/contact", data, false),
  list: (status?: string) => get(`/api/contact${status ? "?status=" + status : ""}`),
  updateStatus: (id: string, status: string) => patch(`/api/contact/${id}`, { status }),
};

// ─── Users (admin) ───────────────────────────────────────────
export const usersApi = {
  list: () => get("/api/users"),
  get: (id: string) => get(`/api/users/${id}`),
  create: (data: unknown) => post("/api/users", data),
  update: (id: string, data: unknown) => patch(`/api/users/${id}`, data),
  remove: (id: string) => del(`/api/users/${id}`),
};
