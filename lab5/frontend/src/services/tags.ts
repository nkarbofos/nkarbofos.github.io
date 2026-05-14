import type { ApiClient } from './client';
import type { Tag } from './types';

export function tagsService(api: ApiClient) {
  return {
    list: async () => api.request<Tag[]>(`/api/tags?page=1&pageSize=100`),
    create: async (payload: { name: string }) =>
      api.request<Tag>('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
  };
}
