import useAuth from '../../../hooks/useAuth';
import { EditableProfileFields } from '../types/profileTypes';
import { profileService } from '../services/profileService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useUserProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.uid],
    queryFn: () => (user?.uid ? profileService.getProfile(user.uid) : null),
    enabled: !!user?.uid
  });

  const { mutate: updateProfile } = useMutation({
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
    }
  });

  return { profile, isLoading, updateProfile };
};
