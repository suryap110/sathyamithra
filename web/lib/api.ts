import { apiClient } from "./api-client";

// ─── Auth ────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post("/auth/login", { email, password }),

  register: (full_name: string, email: string, password: string) =>
    apiClient.post("/auth/register", { full_name, email, password }),

  me: () => apiClient.get("/auth/me"),
};

// ─── Schemes ─────────────────────────────────────────────────
export const schemesApi = {
  list: (params?: {
    search?: string; state?: string; category_id?: string;
    limit?: number; offset?: number;
  }) => apiClient.get("/schemes", { params }),

  get: (id: string) => apiClient.get(`/schemes/${id}`),
  categories: () => apiClient.get("/schemes/categories"),
};

// ─── Eligibility ─────────────────────────────────────────────
export const eligibilityApi = {
  check: (profile: Record<string, unknown>) =>
    apiClient.post("/eligibility/check", profile),

  getProfile: () => apiClient.get("/eligibility/profile"),
  updateProfile: (data: Record<string, unknown>) =>
    apiClient.put("/eligibility/profile", data),
};

// ─── Applications ────────────────────────────────────────────
export const applicationsApi = {
  list: () => apiClient.get("/applications"),
  create: (scheme_id: string, notes?: string) =>
    apiClient.post("/applications", { scheme_id, notes }),
  get: (id: string) => apiClient.get(`/applications/${id}`),
  updateStatus: (id: string, status: string, notes?: string) =>
    apiClient.patch(`/applications/${id}/status`, { status, notes }),
};

// ─── Alerts ──────────────────────────────────────────────────
export const alertsApi = {
  list: (unread_only?: boolean) =>
    apiClient.get("/alerts", { params: { unread_only } }),
  markRead: (id: string) => apiClient.patch(`/alerts/${id}/read`),
  markAllRead: () => apiClient.post("/alerts/read-all"),
};

// ─── Documents ───────────────────────────────────────────────
export const documentsApi = {
  list: () => apiClient.get("/documents"),
  upload: (formData: FormData) =>
    apiClient.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id: string) => apiClient.delete(`/documents/${id}`),
};

// ─── Family ──────────────────────────────────────────────────
export const familyApi = {
  list: () => apiClient.get("/family"),
  create: (data: Record<string, unknown>) => apiClient.post("/family", data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/family/${id}`, data),
  delete: (id: string) => apiClient.delete(`/family/${id}`),
};

// ─── Assistant ───────────────────────────────────────────────
export const assistantApi = {
  chat: (message: string, session_id?: string) =>
    apiClient.post("/assistant/chat", { message, session_id }),
  history: (session_id: string) =>
    apiClient.get(`/assistant/history/${session_id}`),
};

// ─── Locations ───────────────────────────────────────────────
export const locationsApi = {
  list: (params?: { state?: string; type?: string; lat?: number; lng?: number }) =>
    apiClient.get("/locations", { params }),
};

// ─── Life Events ─────────────────────────────────────────────
export const lifeEventsApi = {
  list: () => apiClient.get("/life-events"),
  report: (event_type: string, data?: Record<string, unknown>) =>
    apiClient.post("/life-events", { event_type, ...data }),
};

// ─── User Profile ────────────────────────────────────────────
export const usersApi = {
  me: () => apiClient.get("/users/me"),
  updateProfile: (data: Record<string, unknown>) =>
    apiClient.patch("/users/me", data),
  changePassword: (old_password: string, new_password: string) =>
    apiClient.post("/users/me/change-password", { old_password, new_password }),
};
