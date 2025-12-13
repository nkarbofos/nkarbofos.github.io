import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from '../types';

export const getUserById = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return {
        uid: userDoc.id,
        ...userDoc.data(),
      } as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUserProfile = async (
  uid: string,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    telegramUrl?: string;
  }
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

