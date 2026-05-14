import type { ApiClient } from './client';
import type { UserDb } from './types';

export function usersService(api: ApiClient) {
  return {
    list: async (args?: { page?: number; pageSize?: number }) => {
      const page = args?.page ?? 1;
      const pageSize = args?.pageSize ?? 100;
      return api.request<UserDb[]>(`/api/users?page=${page}&pageSize=${pageSize}`);
    },
    get: async (id: string) => api.request<UserDb>(`/api/users/${id}`),
  };
}

