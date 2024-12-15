import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types/profileTypes';
import { db } from '../../../config/firebase';

export const profileService = {
  async getProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      // TODO: 에러 처리
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  async updateProfile(uid: string, updates: Partial<UserProfile>) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      // TODO: 에러 처리
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};
