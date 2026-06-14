const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Token helpers (localStorage for cross-domain Vercel deployment)
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};
export const setToken = (token: string) => localStorage.setItem("auth_token", token);
export const clearToken = () => localStorage.removeItem("auth_token");

const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  get: (path: string, opts?: RequestInit) =>
    fetch(`${BASE}${path}`, { ...opts, headers: { ...authHeaders(), ...(opts?.headers as Record<string, string> || {}) } }),
  post: (path: string, data: unknown) =>
    fetch(`${BASE}${path}`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(data) }),
  put: (path: string, data: unknown) =>
    fetch(`${BASE}${path}`, { method: "PUT", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(data) }),
  patch: (path: string, data: unknown) =>
    fetch(`${BASE}${path}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(data) }),
  delete: (path: string) =>
    fetch(`${BASE}${path}`, { method: "DELETE", headers: { ...authHeaders() } }),
  upload: (path: string, formData: FormData) =>
    fetch(`${BASE}${path}`, { method: "POST", headers: { ...authHeaders() }, body: formData }),
};
