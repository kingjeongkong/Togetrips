import { chatApiService } from '@/features/chat/services/chatApiService';
import { useSession } from '@/providers/SessionProvider';
import { useQuery } from '@tanstack/react-query';

export const useUnreadCount = () => {
  const { userId } = useSession();

  return useQuery({
    queryKey: ['unreadCount', userId],
    queryFn: async () => {
      if (!userId) return 0;

      return await chatApiService.getTotalUnreadCount();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
