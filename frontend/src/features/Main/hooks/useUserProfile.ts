import { EditableProfileFields } from '../types/profileTypes';
import { profileService } from '../services/profileService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'react-toastify';

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

      const photoURL = updates.photoFile
        ? await profileService.uploadProfileImage(user.uid, updates.photoFile)
        : updates.photoURL;

      const { photoFile, ...updateData } = updates;
      const dataToUpdate = { ...updateData, photoURL };

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
