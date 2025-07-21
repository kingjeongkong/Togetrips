'use client';

import { createRequest } from '@/features/shared/services/requestService';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export const useSendRequest = (otherUserId: string) => {
  const { mutate: sendRequest, isPending: isSending } = useMutation({
    mutationFn: (message: string) => createRequest({ receiverId: otherUserId, message }),
    onSuccess: () => {
      toast.success('Request sent successfully!');
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
