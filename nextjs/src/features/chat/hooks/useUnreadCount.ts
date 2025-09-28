import { chatApiService } from '@/features/chat/services/chatApiService';
import { useSession } from '@/providers/SessionProvider';
import { useQuery } from '@tanstack/react-query';

export const useUnreadCount = () => {
  const { userId } = useSession();

  return useQuery({
    queryKey: ['unreadCount', userId],
    queryFn: async () => {
      if (!userId) return 0;

      const chatRooms = await chatApiService.getDirectChatRooms();
      const gatheringChatRooms = await chatApiService.getGatheringChatRooms();
      return (
        chatRooms.reduce((total, room) => total + room.unreadCount, 0) +
        gatheringChatRooms.reduce((total, room) => total + room.unreadCount, 0)
      );
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
