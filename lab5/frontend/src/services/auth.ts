import type { UserDb } from './types';
import type { ApiClient } from './client';

export function authService(api: ApiClient) {
  return {
    me: async () => api.request<UserDb>('/api/auth/me'),
    registerProfile: async (
      payload: {
        email: string;
        firstName: string;
        lastName: string;
        telegramUrl?: string;
      },
      opts?: { idToken?: string },
    ) =>
      api.request<UserDb>('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(opts?.idToken ? { Authorization: `Bearer ${opts.idToken}` } : {}),
        },
        body: JSON.stringify(payload),
      }),
  };
}
