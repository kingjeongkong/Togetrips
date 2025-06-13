import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../../store/useAuthStore';
import { profileService } from '../services/profileService';
import { EditableProfileFields } from '../types/profileTypes';

export const useUserProfile = () => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.uid],
    queryFn: () => (user?.uid ? profileService.getProfile(user.uid) : null),
    enabled: !!user?.uid,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000
  });

  const { mutateAsync: updateProfile } = useMutation({
    mutationFn: async (updates: EditableProfileFields) => {
      if (!user?.uid) throw new Error('No user');

      const image = updates.photoFile
        ? await profileService.uploadProfileImage(user.uid, updates.photoFile)
        : updates.image;

      const { photoFile, ...updateData } = updates;
      const dataToUpdate = { ...updateData, image };

      return profileService.updateProfile(user.uid, dataToUpdate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.uid] });
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    }
  });

  return { profile, isLoading, updateProfile };
};
