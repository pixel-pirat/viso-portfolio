/**
 * Centralized API client — cookie-based auth only.
 * All requests use credentials: "include" so the HttpOnly cookie
 * set by the server is automatically sent on every request.
 * No tokens are stored in localStorage or sessionStorage.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ─── No-op stubs kept for backward compat with MigrateAdmin ──
export function getToken(): string | null { return null; }
export function setToken(_t: string): void { /* cookie-only */ }
export function clearToken(): void { /* cookie-only */ }

// ─── Core fetch wrapper ──────────────────────────────────────
async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", // always send cookie
  });

  if (res.status === 401) {
    // Dispatch event so auth context can react (redirect to login)
    window.dispatchEvent(new CustomEvent("studio:unauthorized"));
  }

  if (!res.ok) {
    let errorMsg = `API error ${res.status}`;
    try {
      const body = await res.json();
      errorMsg = body.error || body.message || errorMsg;
    } catch { /* ignore */ }
    throw new Error(errorMsg);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

const get  = <T = unknown>(path: string) => apiFetch<T>(path, { method: "GET" });
const post = <T = unknown>(path: string, body: unknown) => apiFetch<T>(path, { method: "POST",  body: JSON.stringify(body) });
const patch = <T = unknown>(path: string, body: unknown) => apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) });
const del  = <T = unknown>(path: string) => apiFetch<T>(path, { method: "DELETE" });

// ─── Auth ────────────────────────────────────────────────────
export const authApi = {
  login:    (email: string, password: string) =>
    post<{ user: { id: string; name: string; email: string; role: string } }>("/api/auth/login", { email, password }),
  register: (name: string, email: string, password: string) =>
    post<{ user: { id: string; name: string; email: string; role: string } }>("/api/auth/register", { name, email, password }),
  me:       () => get<{ id: string; name: string; email: string; role: string; avatar_url: string }>("/api/auth/me"),
  logout:   () => post<{ success: boolean }>("/api/auth/logout", {}),
};

// ─── Services ────────────────────────────────────────────────
export const servicesApi = {
  list:    ()                     => get("/api/services"),
  listAll: ()                     => get("/api/services/all"),
  get:     (slug: string)         => get(`/api/services/${slug}`),
  create:  (data: unknown)        => post("/api/services", data),
  update:  (id: string, data: unknown) => patch(`/api/services/${id}`, data),
  remove:  (id: string)           => del(`/api/services/${id}`),
};

// ─── Projects ────────────────────────────────────────────────
export const projectsApi = {
  list: (params?: { category?: string; featured?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set("category", params.category);
    if (params?.featured) qs.set("featured", "true");
    const q = qs.toString();
    return get(`/api/projects${q ? "?" + q : ""}`);
  },
  listAll: ()                     => get("/api/projects/all"),
  get:     (slug: string)         => get(`/api/projects/${slug}`),
  create:  (data: unknown)        => post("/api/projects", data),
  update:  (id: string, data: unknown) => patch(`/api/projects/${id}`, data),
  remove:  (id: string)           => del(`/api/projects/${id}`),
};

// ─── Blog ─────────────────────────────────────────────────────
export const blogApi = {
  list:    (category?: string)    => get(`/api/blog${category ? "?category=" + category : ""}`),
  listAll: ()                     => get("/api/blog/all"),
  get:     (slug: string)         => get(`/api/blog/${slug}`),
  create:  (data: unknown)        => post("/api/blog", data),
  update:  (id: string, data: unknown) => patch(`/api/blog/${id}`, data),
  remove:  (id: string)           => del(`/api/blog/${id}`),
};

// ─── Hero ─────────────────────────────────────────────────────
export const heroApi = {
  get:          ()                => get("/api/hero"),
  createSlide:  (data: unknown)   => post("/api/hero/slides", data),
  updateSlide:  (id: string, data: unknown) => patch(`/api/hero/slides/${id}`, data),
  deleteSlide:  (id: string)      => del(`/api/hero/slides/${id}`),
  addActivity:  (data: unknown)   => post("/api/hero/activity", data),
};

// ─── Bookings ────────────────────────────────────────────────
export const bookingsApi = {
  submit:       (data: unknown)   => post("/api/bookings", data),
  list:         (status?: string) => get(`/api/bookings${status ? "?status=" + status : ""}`),
  get:          (id: string)      => get(`/api/bookings/${id}`),
  updateStatus: (id: string, status: string) => patch(`/api/bookings/${id}`, { status }),
  mine:         ()                => get("/api/bookings/mine"),
};

// ─── Proposals ───────────────────────────────────────────────
export const proposalsApi = {
  list:   ()                      => get("/api/proposals"),
  mine:   ()                      => get("/api/proposals/mine"),
  get:    (id: string)            => get(`/api/proposals/${id}`),
  create: (data: unknown)         => post("/api/proposals", data),
  update: (id: string, data: unknown) => patch(`/api/proposals/${id}`, data),
};

// ─── Client Projects ─────────────────────────────────────────
export const clientProjectsApi = {
  list:            ()             => get("/api/client-projects"),
  mine:            ()             => get("/api/client-projects/mine"),
  get:             (id: string)   => get(`/api/client-projects/${id}`),
  create:          (data: unknown) => post("/api/client-projects", data),
  update:          (id: string, data: unknown) => patch(`/api/client-projects/${id}`, data),
  addMessage:      (id: string, body: string)  => post(`/api/client-projects/${id}/messages`, { body }),
  addMilestone:    (id: string, data: unknown) => post(`/api/client-projects/${id}/milestones`, data),
  updateMilestone: (pid: string, id: string, data: unknown) => patch(`/api/client-projects/${pid}/milestones/${id}`, data),
  addInvoice:      (id: string, data: unknown) => post(`/api/client-projects/${id}/invoices`, data),
  updateInvoice:   (pid: string, id: string, data: unknown) => patch(`/api/client-projects/${pid}/invoices/${id}`, data),
};

// ─── Appointments ────────────────────────────────────────────
export const appointmentsApi = {
  book:   (data: unknown) => post("/api/appointments", data),
  list:   (params?: { status?: string; date?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.date)   qs.set("date", params.date);
    const q = qs.toString();
    return get(`/api/appointments${q ? "?" + q : ""}`);
  },
  mine:   ()              => get("/api/appointments/mine"),
  update: (id: string, data: unknown) => patch(`/api/appointments/${id}`, data),
  remove: (id: string)    => del(`/api/appointments/${id}`),
};

// ─── Collaborations ──────────────────────────────────────────
export const collaborationsApi = {
  list: (params?: { category?: string; stage?: string }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set("category", params.category);
    if (params?.stage)    qs.set("stage", params.stage);
    const q = qs.toString();
    return get(`/api/collaborations${q ? "?" + q : ""}`);
  },
  listAll:       ()               => get("/api/collaborations/all"),
  mine:          ()               => get("/api/collaborations/mine"),
  get:           (id: string)     => get(`/api/collaborations/${id}`),
  create:        (data: unknown)  => post("/api/collaborations", data),
  update:        (id: string, data: unknown) => patch(`/api/collaborations/${id}`, data),
  request:       (id: string, data: unknown) => post(`/api/collaborations/${id}/requests`, data),
  getRequests:   (id: string)     => get(`/api/collaborations/${id}/requests`),
  updateRequest: (id: string, rid: string, status: string) => patch(`/api/collaborations/${id}/requests/${rid}`, { status }),
  addUpdate:     (id: string, data: unknown) => post(`/api/collaborations/${id}/updates`, data),
  report:        (id: string, data: unknown) => post(`/api/collaborations/${id}/reports`, data),
  giveConsent:   (version = "1.0") => post("/api/collaborations/consent", { version }),
};

// ─── Notifications ───────────────────────────────────────────
export const notificationsApi = {
  list:        ()              => get("/api/notifications"),
  markRead:    (id: string)    => patch(`/api/notifications/${id}/read`, {}),
  markAllRead: ()              => post("/api/notifications/read-all", {}),
  broadcast:   (data: unknown) => post("/api/notifications", data),
};

// ─── Settings ────────────────────────────────────────────────
export const settingsApi = {
  get:    ()              => get("/api/settings"),
  update: (data: unknown) => patch("/api/settings", data),
};

// ─── Contact ─────────────────────────────────────────────────
export const contactApi = {
  submit:       (data: unknown)  => post("/api/contact", data),
  list:         (status?: string) => get(`/api/contact${status ? "?status=" + status : ""}`),
  updateStatus: (id: string, status: string) => patch(`/api/contact/${id}`, { status }),
};

// ─── Users ───────────────────────────────────────────────────
export const usersApi = {
  list:   ()              => get("/api/users"),
  get:    (id: string)    => get(`/api/users/${id}`),
  create: (data: unknown) => post("/api/users", data),
  update: (id: string, data: unknown) => patch(`/api/users/${id}`, data),
  remove: (id: string)    => del(`/api/users/${id}`),
};
