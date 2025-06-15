'use client';

import { db } from '@/lib/firebase-config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  image: string;
  bio: string;
  tags: string;
  city: string;
  state: string;
}

export const useNearbyUsers = (cityInfo: { city: string; state: string }) => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNearbyUsers = async () => {
      if (!session?.user?.id) return;

      try {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('location.city', '==', cityInfo.city),
          where('location.state', '==', cityInfo.state),
        );

        const querySnapshot = await getDocs(q);
        const nearbyUsers: User[] = [];

        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.id !== session.user.id) {
            nearbyUsers.push({
              id: doc.id,
              name: userData.name,
              image: userData.image,
              bio: userData.bio,
              tags: userData.tags,
              city: userData.city,
              state: userData.state,
            });
          }
        });

        setUsers(nearbyUsers);
      } catch (error) {
        console.error('Error fetching nearby users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNearbyUsers();
  }, [session, cityInfo]);

  return { users, isLoading };
};
