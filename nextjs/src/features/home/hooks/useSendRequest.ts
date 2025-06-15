'use client';

import { db } from '@/lib/firebase-config';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export const useSendRequest = (receiverId: string) => {
  const { data: session } = useSession();
  const [hasExistingRequest, setHasExistingRequest] = useState(false);

  useEffect(() => {
    const checkExistingRequest = async () => {
      if (!session?.user?.id) return;

      try {
        const requestsRef = collection(db, 'requests');
        const q = query(
          requestsRef,
          where('senderId', '==', session.user.id),
          where('receiverId', '==', receiverId),
          where('status', '==', 'pending'),
        );

        const querySnapshot = await getDocs(q);
        setHasExistingRequest(!querySnapshot.empty);
      } catch (error) {
        console.error('Error checking existing request:', error);
      }
    };

    checkExistingRequest();
  }, [session, receiverId]);

  const sendRequest = async (message: string) => {
    if (!session?.user?.id) return;

    try {
      await addDoc(collection(db, 'requests'), {
        senderId: session.user.id,
        receiverId,
        message,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      setHasExistingRequest(true);
    } catch (error) {
      console.error('Error sending request:', error);
      throw error;
    }
  };

  return { sendRequest, hasExistingRequest };
};
