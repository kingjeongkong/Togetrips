'use client';

import { User } from '@/features/shared/types/User';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { fetchNearbyUsers } from '../services/nearbyUserService';

export default function useNearbyUsers(city: string, state: string) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['nearbyUsers', city, state, userId],
    queryFn: () => {
      if (!userId) return [];
      return fetchNearbyUsers(city, state, userId);
    },
    enabled: !!userId && !!city && !!state,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    throwOnError: true,
  });

  return {
    users: (data || []) as User[],
    isLoading,
  };
}

// 주변 사용자 목록 갱신이 필요할 때 호출할 invalidate 함수
export const invalidateNearbyUsers = (city: string, state: string, userId: string) => {
  const queryClient = useQueryClient();
  return queryClient.invalidateQueries({
    queryKey: ['nearbyUsers', city, state, userId],
  });
};
