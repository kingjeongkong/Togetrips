import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Profile {
  id: string;
  name: string;
  image: string;
  bio: string;
  tags: string;
  city: string;
  state: string;
}

const fetchProfile = async (userId: string): Promise<Profile> => {
  const response = await fetch(`/api/profile?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch profile.');
  }
  return response.json();
};

export default function useProfile(userId: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId),
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
