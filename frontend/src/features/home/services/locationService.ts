import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { UserProfile } from '@firebase/auth'; 

export const locationService = {
  async updateUserLocationDB(userID: string, city: string, state: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userID);
      await updateDoc(userRef, {
        'location.city': city,
        'location.state': state,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      // ToDo : 에러 처리 다시
      console.error(`Failed to update location for user : `, error);
      throw new Error('Failed to update location');
    }
  },

  async findUsersInSameCity(city: string, state: string): Promise<UserProfile[]> {
    const userRef = collection(db, 'users');
    const q = query(
      userRef,
      where('location.city', '==', city),
      where('location.state', '==', state)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ uid: doc.id, ...doc.data() } as UserProfile)
    );
  }
};
