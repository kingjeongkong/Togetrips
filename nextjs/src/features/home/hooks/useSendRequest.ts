'use client';

import {
  createRequest,
  fetchRequestsBetweenUsers,
} from '@/features/shared/services/requestService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

export const useSendRequest = (otherUserId: string) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // 서버의 중복 체크와 별개로, UI 업데이트를 위해 기존 요청 상태를 조회
  const { data: hasExistingRequest, isLoading: isChecking } = useQuery({
    queryKey: ['existingRequest', otherUserId, currentUserId],
    queryFn: async () => {
      if (!currentUserId) return false;
      const requests = await fetchRequestsBetweenUsers(currentUserId, otherUserId, ['pending']);
      return requests.length > 0;
    },
    enabled: !!currentUserId && !!otherUserId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { mutate: sendRequest, isPending: isSending } = useMutation({
    mutationFn: (message: string) => createRequest({ receiverID: otherUserId, message }),
    onSuccess: () => {
      toast.success('Request sent successfully!');
      queryClient.setQueryData(['existingRequest', otherUserId, currentUserId], true);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send request.');
    },
  });

  return {
    sendRequest,
    isLoading: isSending || isChecking,
    isRequestSent: hasExistingRequest,
  };
};
