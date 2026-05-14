import { useCallback, useMemo } from 'react';
import { useAuth } from '../state/AuthContext';
import type { ApiClient } from '../services/client';

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3010';

export function useApi() {
  const { getIdToken } = useAuth();

  const request: ApiClient['request'] = useCallback(
    async <T>(path: string, init?: RequestInit): Promise<T> => {
      const token = await getIdToken();
      const headers = new Headers(init?.headers ?? {});
      if (token) headers.set('Authorization', `Bearer ${token}`);

      // If body is FormData, don't set Content-Type manually (browser will set boundary).
      const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

      if (res.status === 304) throw new Error('Not Modified');
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      return (await res.json()) as T;
    },
    [getIdToken],
  );

  return useMemo(() => ({ request }), [request]);
}
