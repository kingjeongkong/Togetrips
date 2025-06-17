'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProfile } from '../services/profileService';

export default function useProfile(userId: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => {
      if (!userId) return Promise.reject(new Error('No userId'));
      return fetchProfile(userId);
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
