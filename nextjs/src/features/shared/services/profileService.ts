import type { User } from '@/features/shared/types/User';
import { db, storage } from '@/lib/firebase-config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

export const profileService = {
  /**
   * 유저 프로필 조회
   */
  async getProfile(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: userDoc.id,
          ...data,
        } as User;
      }

      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  /**
   * 프로필 이미지 업로드
   */
  async uploadProfileImage(userId: string, file: File): Promise<string> {
    const storageRef = ref(storage, `profiles/${userId}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  },

  /**
   * 유저 프로필 수정
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },
};
