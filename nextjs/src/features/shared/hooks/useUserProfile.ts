'use client';

import { profileService } from '@/features/shared/services/profileService';
import { EditableProfileFields } from '@/features/shared/types/profileTypes';
import type { User } from '@/features/shared/types/User';
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
    mutationFn: async (updates: EditableProfileFields) => {
      if (!userId) throw new Error('No user');

      // 이미지 파일이 있으면 업로드
      const imageUrl = updates.photoFile
        ? await profileService.uploadProfileImage(updates.photoFile)
        : updates.image;

      // photoFile 제외하고 업데이트할 데이터 준비
      const updateData = { ...updates };
      delete updateData.photoFile;
      const dataToUpdate = { ...updateData, image: imageUrl };

      await profileService.updateProfile(dataToUpdate);

      // 업데이트된 프로필 데이터 반환 (캐시 업데이트용)
      return {
        ...profile,
        ...dataToUpdate,
        updatedAt: new Date().toISOString(),
      } as User;
    },
    onSuccess: (updatedProfile) => {
      // 로컬 캐시 직접 업데이트 (네트워크 요청 없이)
      queryClient.setQueryData(['profile', userId], updatedProfile);
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  return { profile, isLoading, updateProfile };
};
