import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types/profileTypes';
import { db, storage } from '../../../config/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

export const profileService = {
  async getProfile(uid: string): Promise<UserProfile | null> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  },

  async updateProfile(uid: string, updates: Partial<UserProfile>) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  },

  async uploadProfileImage(uid: string, file: File): Promise<string> {
    const storageRef = ref(storage, `profiles/${uid}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  }
};
