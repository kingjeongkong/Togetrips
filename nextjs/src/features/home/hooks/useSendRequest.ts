'use client';

import type { Request } from '@/features/shared/types/Request';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

// Request 타입에서 필요한 필드만 Pick
export type SendRequestParams = Pick<Request, 'senderId' | 'receiverId' | 'message'>;

const checkRequestByStatus = async (userAId: string, userBId: string, status: string) => {
  const url = `/api/requests?userAId=${userAId}&userBId=${userBId}&status=${status}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to check request status.');
  const reqs = await res.json();
  return reqs.length > 0;
};

const sendRequest = async ({ senderId, receiverId, message }: SendRequestParams) => {
  const response = await fetch('/api/requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      senderId,
      receiverId,
      message,
    }),
  });

  if (!response.ok) {
    toast.error('Failed to send request. Please try again.');
  }

  return response.json();
};

export const useSendRequest = (otherUserId: string) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: hasExistingRequest = false, refetch: updateExistingRequest } = useQuery({
    queryKey: ['existingRequest', otherUserId, userId],
    queryFn: async () => {
      if (!userId) return false;
      return checkRequestByStatus(userId, otherUserId, 'pending');
    },
    enabled: !!otherUserId && !!userId,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  const sendRequestMutation = async (message?: string) => {
    if (!userId) throw new Error('Login required.');

    const result = await sendRequest({
      senderId: userId,
      receiverId: otherUserId,
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
