'use client';

import type { Request } from '@/features/shared/types/Request';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { createRequest, fetchRequestsBetweenUsers } from '../services/requestService';

// Request 타입에서 필요한 필드만 Pick
export type SendRequestParams = Pick<Request, 'senderId' | 'receiverId' | 'message'>;

const checkRequestByStatus = async (userAId: string, userBId: string, status: string) => {
  if (!userAId || !userBId) return false;
  const reqs = await fetchRequestsBetweenUsers(userAId, userBId, [status]);
  return reqs.length > 0;
};

const sendRequest = async ({ senderId, receiverId, message }: SendRequestParams) => {
  try {
    await createRequest({ senderId, receiverId, message: message || '' });
    return { ok: true };
  } catch (error) {
    toast.error('Failed to send request. Please try again.');
    return { ok: false };
  }
};

export const useSendRequest = (otherUserId: string) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: hasExistingRequest = false, refetch: updateExistingRequest } = useQuery({
    queryKey: ['existingRequest', otherUserId, userId],
    queryFn: async () => {
      if (!userId || !otherUserId) return false;
      return checkRequestByStatus(userId, otherUserId, 'pending');
    },
    enabled: !!otherUserId && !!userId,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  const sendRequestMutation = async (message?: string) => {
    if (!userId || !otherUserId) return { ok: false };

    const result = await sendRequest({
      senderId: userId as string,
      receiverId: otherUserId as string,
      message,
    });

    if (result.ok) {
      updateExistingRequest();
      queryClient.invalidateQueries({ queryKey: ['existingRequest', otherUserId, userId] });
    }

    return result;
  };

  return {
    sendRequest: sendRequestMutation,
    hasExistingRequest,
  };
};
