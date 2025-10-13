'use client';

import { ConflictError } from '@/error/customErrors';
import { createRequest } from '@/features/home/services/createRequestService';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export const useSendRequest = (otherUserId: string) => {
  const { mutate: sendRequest, isPending: isSending } = useMutation({
    mutationFn: (message: string) => createRequest({ receiverId: otherUserId, message }),
    onSuccess: () => {
      toast.success('Request sent successfully!');
    },
    onError: (error: Error) => {
      if (error instanceof ConflictError) {
        toast.warning('A request already exists between you and this user.');
      } else {
        toast.error(error.message || 'Failed to send request.');
      }
    },
  });

  return {
    sendRequest,
    isLoading: isSending,
  };
};
