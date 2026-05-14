import type { ApiClient } from './client';
import type { Course } from './types';

export function coursesService(api: ApiClient) {
  return {
    list: async () => api.request<Course[]>(`/api/courses?page=1&pageSize=100`),
  };
}
