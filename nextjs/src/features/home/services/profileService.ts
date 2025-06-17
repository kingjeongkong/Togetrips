import type { User } from '@/features/shared/types/User';
import { db } from '@/lib/firebase-config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * 유저 프로필 조회
 */
export async function fetchProfile(userId: string): Promise<User | null> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) return null;
  return { id: userDoc.id, ...userDoc.data() } as User;
}

/**
 * 유저 프로필 수정
 */
export async function updateProfile(userId: string, data: Partial<User>): Promise<User | null> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) return null;
  return { id: userDoc.id, ...userDoc.data() } as User;
}
