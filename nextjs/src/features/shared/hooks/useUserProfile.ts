'use client';

import { EditableProfileFields } from '@/features/shared/types/profileTypes';
import { db } from '@/lib/firebase-config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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

  const updateProfile = async (profileData: EditableProfileFields) => {
    if (!session?.user?.id) return;
    const userRef = doc(db, 'users', session.user.id);
    // image 필드만 예시로 업데이트 (photoFile 업로드 등은 추후 구현)
    await updateDoc(userRef, {
      name: profileData.name,
      image: profileData.image,
      tags: profileData.tags,
      bio: profileData.bio,
    });
    // 수정 후 최신 데이터 fetch
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      setProfile(userDoc.data() as UserProfile);
    }
  };

  return { profile, isLoading, updateProfile };
};
