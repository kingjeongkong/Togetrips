'use client';

import type { User } from '@/features/shared/types/User';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const fetchProfile = async (userId: string): Promise<User> => {
  const response = await fetch(`/api/profile?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch profile.');
  }
  return response.json();
};

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
