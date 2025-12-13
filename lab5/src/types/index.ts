import { Timestamp } from 'firebase/firestore';

export interface Archive {
  id: string;
  linkName: string;
  githubPagesUrl: string;
  userId: string;
  firstName: string;
  lastName: string;
  tags: string[];
  uploadedAt: Timestamp;
}

export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  telegramUrl?: string;
}

export interface LinkFormData {
  linkName: string;
  githubPagesUrl: string;
  tags: string[];
}

export const AVAILABLE_TAGS = [
  'html',
  'css',
  'javascript',
  'typescript',
  'react',
  'vue',
  'angular',
  'node',
  'python',
  'php',
  'java',
  'csharp',
  'go',
  'rust',
  'svelte',
  'nextjs',
  'nuxt',
  'tailwind',
  'bootstrap',
  'sass',
] as const;

export type Tag = typeof AVAILABLE_TAGS[number];


