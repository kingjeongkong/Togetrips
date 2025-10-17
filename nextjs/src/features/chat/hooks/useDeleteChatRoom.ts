import { chatApiService } from '@/features/chat/services/chatApiService';
import { useSession } from '@/providers/SessionProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { DirectChatRoomListItem } from '../types/chatTypes';

export const useDeleteChatRoom = () => {
  const queryClient = useQueryClient();
  const { userId } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  return useMutation({
    mutationFn: (chatRoomId: string) => chatApiService.deleteChatRoom(chatRoomId),
    onSuccess: (_, chatRoomId) => {
      // 채팅방 목록 캐시 무효화
      queryClient.setQueryData(
        ['directChatRooms', userId],
        (oldData: DirectChatRoomListItem[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter((chatRoom) => chatRoom.id !== chatRoomId);
        },
      );
      // unread count 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['unreadCount', userId] });
      toast.success('Chat room deleted successfully');

      // 현재 채팅방이 삭제된 경우 목록으로 이동
      if (pathname.includes(chatRoomId)) {
        router.push('/chat');
      }
    },
    onError: (error) => {
      console.error('Failed to delete chat room:', error);
      toast.error('Failed to delete chat room');
    },
  });
};
