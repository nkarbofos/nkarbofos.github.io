import type { ApiClient } from './client';
import type { LinkBase, LinkWithRelations } from './types';

export function linksService(api: ApiClient) {
  return {
    list: async (args: {
      page?: number;
      pageSize?: number;
      userId?: string;
      tagId?: string;
      courseId?: string;
    }) => {
      const qs = new URLSearchParams();
      qs.set('page', String(args.page ?? 1));
      qs.set('pageSize', String(args.pageSize ?? 20));
      if (args.userId) qs.set('userId', args.userId);
      if (args.tagId) qs.set('tagId', args.tagId);
      if (args.courseId) qs.set('courseId', args.courseId);
      return api.request<LinkWithRelations[]>(`/api/links?${qs.toString()}`);
    },
    create: async (payload: {
      userId: string;
      reviewId?: string;
      linkName: string;
      githubPagesUrl: string;
    }) =>
      api.request<LinkBase>('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    update: async (
      id: string,
      payload: { linkName?: string; githubPagesUrl?: string },
    ) =>
      api.request<LinkBase>(`/api/links/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    addTag: async (id: string, tagId: string) =>
      api.request(`/api/links/${id}/tags/${tagId}`, { method: 'POST' }),
    removeTag: async (id: string, tagId: string) =>
      api.request(`/api/links/${id}/tags/${tagId}`, { method: 'DELETE' }),
    addCourse: async (id: string, courseId: string) =>
      api.request(`/api/links/${id}/courses/${courseId}`, { method: 'POST' }),
    removeCourse: async (id: string, courseId: string) =>
      api.request(`/api/links/${id}/courses/${courseId}`, { method: 'DELETE' }),
  };
}
