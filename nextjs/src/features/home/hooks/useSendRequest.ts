'use client';

import { createRequest } from '@/features/shared/services/requestService';
import { useSession } from '@/providers/SessionProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export const useSendRequest = (otherUserId: string) => {
  const queryClient = useQueryClient();
  const { userId: currentUserId } = useSession();

  const { mutate: sendRequest, isPending: isSending } = useMutation({
    mutationFn: (message: string) => createRequest({ receiverId: otherUserId, message }),
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
    isLoading: isSending,
  };
};
