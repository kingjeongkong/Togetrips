import { useSession } from '@/providers/SessionProvider';
import { useQuery } from '@tanstack/react-query';

export const useRequestCount = () => {
  const { userId } = useSession();

  return useQuery({
    queryKey: ['requestCount', userId],
    queryFn: async () => {
      if (!userId) return 0;

      const response = await fetch('/api/request/my-requests');
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();

      // 받은 요청 중 pending 상태인 것만 카운트
      const count =
        data.requests?.filter(
          (request: any) => request.receiverId === userId && request.status === 'pending',
        ).length || 0;

      return count;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
