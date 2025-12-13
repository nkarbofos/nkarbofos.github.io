import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Archive } from '../types';

export interface CreateArchiveData {
  linkName: string;
  githubPagesUrl: string;
  userId: string;
  firstName: string;
  lastName: string;
  tags: string[];
}

export const createArchive = async (data: CreateArchiveData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'archives'), {
      ...data,
      uploadedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating archive:', error);
    throw error;
  }
};

export const getArchives = async (filters?: {
  tags?: string[];
  userId?: string;
}): Promise<Archive[]> => {
  try {
    let q;
    
    // Build query based on filters
    if (filters?.tags && filters.tags.length > 0 && filters?.userId) {
      // Both filters - need composite query
      q = query(
        collection(db, 'archives'),
        where('tags', 'array-contains-any', filters.tags),
        where('userId', '==', filters.userId),
        orderBy('uploadedAt', 'desc')
      );
    } else if (filters?.tags && filters.tags.length > 0) {
      // Only tags filter
      q = query(
        collection(db, 'archives'),
        where('tags', 'array-contains-any', filters.tags),
        orderBy('uploadedAt', 'desc')
      );
    } else if (filters?.userId) {
      // Only userId filter
      q = query(
        collection(db, 'archives'),
        where('userId', '==', filters.userId),
        orderBy('uploadedAt', 'desc')
      );
    } else {
      // No filters
      q = query(collection(db, 'archives'), orderBy('uploadedAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const archives: Archive[] = [];

    querySnapshot.forEach((doc) => {
      archives.push({
        id: doc.id,
        ...doc.data(),
      } as Archive);
    });

    return archives;
  } catch (error: any) {
    // If query fails due to missing index, provide helpful error
    if (error.code === 'failed-precondition') {
      throw new Error(
        'Необходимо создать индекс в Firestore. Проверьте консоль Firebase для инструкций.'
      );
    }
    console.error('Error fetching archives:', error);
    throw error;
  }
};

export const getAllTags = async (): Promise<string[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'archives'));
    const tagsSet = new Set<string>();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.tags && Array.isArray(data.tags)) {
        data.tags.forEach((tag: string) => tagsSet.add(tag));
      }
    });

    return Array.from(tagsSet);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};

export const getAllUsers = async (): Promise<Array<{ userId: string; firstName: string; lastName: string }>> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'archives'));
    const usersMap = new Map<string, { firstName: string; lastName: string }>();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.userId && data.firstName && data.lastName) {
        usersMap.set(data.userId, {
          firstName: data.firstName,
          lastName: data.lastName,
        });
      }
    });

    return Array.from(usersMap.entries()).map(([userId, name]) => ({
      userId,
      ...name,
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

