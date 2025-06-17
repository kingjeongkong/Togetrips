'use client';

import { db } from '@/lib/firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface UserProfile {
  name: string;
  image: string;
  bio: string;
  tags: string;
}

export const useUserProfile = () => {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) {
        return;
      }

      try {
        const userRef = doc(db, 'users', session.user.id);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  return { profile, isLoading };
};
