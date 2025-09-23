import { chatService } from '@/features/chat/services/chatService';
import { useSession } from '@/providers/SessionProvider';
import { useQuery } from '@tanstack/react-query';

export const useUnreadCount = () => {
  const { userId } = useSession();

  return useQuery({
    queryKey: ['unreadCount', userId],
    queryFn: async () => {
      if (!userId) return 0;

      const chatRooms = await chatService.getDirectChatRooms();
      return chatRooms.reduce((total, room) => total + room.unreadCount, 0);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
