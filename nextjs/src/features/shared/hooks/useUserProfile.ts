'use client';

import { profileService } from '@/features/shared/services/profileService';
import { useSession } from '@/providers/SessionProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export const useMyProfile = () => {
  const { userId } = useSession();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => (userId ? profileService.getProfile(userId) : null),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });

  const { mutateAsync: updateProfile } = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!userId) throw new Error('No user');

      const updatedProfile = await profileService.updateProfile(formData);
      return updatedProfile;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile', userId], updatedProfile);
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  return { profile, isLoading, updateProfile };
};
