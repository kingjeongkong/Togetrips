'use client';

import { profileService } from '@/features/shared/services/profileService';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function useProfile(userId: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => {
      if (!userId) return Promise.reject(new Error('No userId'));
      return profileService.getProfile(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    throwOnError: true,
  });

  return {
    profile: data,
    isLoading,
  };
}

// 프로필 수정 시 호출할 invalidate 함수
export const invalidateProfile = (userId: string) => {
  const queryClient = useQueryClient();
  return queryClient.invalidateQueries({ queryKey: ['profile', userId] });
};
