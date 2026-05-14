export type UserDb = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  telegramUrl?: string | null;
  avatarUrl?: string | null;
  role?: 'USER' | 'ADMIN';
  firebaseUid?: string | null;
};

export type Tag = { id: string; name: string };
export type Course = { id: string; name: string; code?: string | null };

export type LinkBase = {
  id: string;
  userId: string;
  reviewId?: string | null;
  linkName: string;
  githubPagesUrl: string;
  createdAt: string;
};

export type LinkWithRelations = LinkBase & {
  user: UserDb;
  tags: { tag: Tag }[];
  courses: { course: Course }[];
};
