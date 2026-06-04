import { useState, useCallback } from "react";
import type { ApiResponse } from "@nul/shared";

export function getToken(): string | null {
  return localStorage.getItem("nul_token");
}

export function setToken(token: string): void {
  localStorage.setItem("nul_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("nul_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const base = (import.meta.env.VITE_SERVER_URL as string ?? "").replace(/\/$/, "");
  const res = await fetch(`${base}/api${path}`, {
    ...options,
    headers: {
      ...(options.body != null ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  return res.json() as Promise<ApiResponse<T>>;
}

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(async (path: string, options?: RequestInit) => {
    setLoading(true);
    setError(null);
    try {
      const res = await request<T>(path, options);
      if (res.success && res.data !== undefined) {
        setData(res.data);
      } else {
        setError(res.error ?? "Unknown error");
      }
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, call };
}

export { request };
