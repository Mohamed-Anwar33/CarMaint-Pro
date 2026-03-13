/**
 * Secure API client — automatically injects the Supabase JWT
 * into every request to the backend API server.
 */
import { supabase } from "./supabase";

const BASE = import.meta.env.VITE_API_URL || import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

let cachedToken: string | null = null;

supabase.auth.onAuthStateChange((_event, session) => {
  cachedToken = session?.access_token || null;
});

async function getAuthHeaders(): Promise<Record<string, string>> {
  if (!cachedToken) {
    const { data } = await supabase.auth.getSession();
    cachedToken = data.session?.access_token || null;
  }
  
  if (!cachedToken) return { "Content-Type": "application/json" };
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cachedToken}`,
  };
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> | undefined) },
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errBody.error || `HTTP ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  setCachedToken: (token: string | null) => { cachedToken = token; },
};
