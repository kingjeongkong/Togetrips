import {
  DirectChatRoomListItem,
  GatheringChatRoomListItem,
  Message,
} from '@/features/chat/types/chatTypes';
import { supabase } from '@/lib/supabase-config';
import { useSession } from '@/providers/SessionProvider';
import { useRealtimeStore } from '@/stores/realtimeStore';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export const useGlobalSubscription = () => {
  const { userId } = useSession();
  const queryClient = useQueryClient();
  const { incrementMessageCount, incrementRequestCount, decrementRequestCount } =
    useRealtimeStore();

  useEffect(() => {
    if (!userId) return;

    console.log('🎯 중앙 관제실: 실시간 구독 시작', { userId });

    // 모든 messages 테이블의 INSERT 이벤트를 구독
    const messageChannel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const rawMessage = payload.new;

          const chatRoomId = rawMessage.chat_room_id;
          const senderId = rawMessage.sender_id;

          if (senderId === userId) return;

          console.log('📬 중앙 관제실: 새 메시지 수신! 캐시 업데이트 시작', rawMessage);

          // 1. 이 메시지가 어떤 종류의 채팅방에 속하는지 캐시를 통해 확인합니다.
          const directRooms = queryClient.getQueryData<DirectChatRoomListItem[]>([
            'directChatRooms',
            userId,
          ]);
          const groupRooms = queryClient.getQueryData<GatheringChatRoomListItem[]>([
            'gatheringChatRooms',
            userId,
          ]);

          const isDirectChat = directRooms?.some((room) => room.id === chatRoomId);
          const isGroupChat = groupRooms?.some((room) => room.id === chatRoomId);

          // 2. 내가 참여한 채팅방의 메시지가 아니면 무시합니다.
          if (!isDirectChat && !isGroupChat) {
            console.log('🚫 내가 참여한 채팅방의 메시지가 아니므로 무시합니다.');
            return;
          }

          // 3. 중앙 Zustand 스토어의 전체 카운트를 즉시 +1 합니다.
          incrementMessageCount();

          // 4. 타입에 맞는 채팅방 "목록" 캐시만 업데이트합니다.
          const listQueryKey = isDirectChat
            ? ['directChatRooms', userId]
            : ['gatheringChatRooms', userId];

          queryClient.setQueryData(listQueryKey, (oldData: any[] | undefined) => {
            if (!oldData) return oldData;

            let targetRoom: any = null;
            const otherRooms = oldData.filter((room) => {
              if (room.id === chatRoomId) {
                targetRoom = room;
                return false;
              }
              return true;
            });

            if (!targetRoom) return oldData;

            targetRoom.lastMessage = rawMessage.content;
            targetRoom.lastMessageTime = rawMessage.timestamp;
            targetRoom.unreadCount = (targetRoom.unreadCount || 0) + 1;

            return [targetRoom, ...otherRooms];
          });

          // 5. 타입에 맞는 "상세" 데이터 캐시도 조용히 업데이트합니다.
          const detailQueryKey = isDirectChat
            ? ['directChatRoomWithMessages', chatRoomId]
            : ['groupChatRoomWithMessages', chatRoomId];

          // Message 타입으로 변환
          const newMessage: Message = {
            id: rawMessage.id,
            chatRoomId: rawMessage.chat_room_id,
            senderId: rawMessage.sender_id,
            content: rawMessage.content,
            timestamp: rawMessage.timestamp,
            read: rawMessage.read,
          };

          queryClient.setQueryData(detailQueryKey, (oldData: any | undefined) => {
            if (!oldData || oldData.messages?.some((msg: Message) => msg.id === newMessage.id)) {
              return oldData;
            }
            return { ...oldData, messages: [...(oldData.messages || []), newMessage] };
          });
        },
      )
      .subscribe();

    // 모든 requests 테이블의 INSERT/UPDATE 이벤트를 구독
    const requestChannel = supabase
      .channel('public:requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
        },
        (payload) => {
          // 나에게 온 새로운 요청(pending)일 경우 카운트 증가
          if (payload.eventType === 'INSERT' && payload.new.receiver_id === userId) {
            console.log('📬 중앙 관제실: 새 요청 수신!', payload.new);
            incrementRequestCount();
          }
          // 내 요청이 수락/거절된 경우 카운트 감소
          if (payload.eventType === 'UPDATE' && payload.old.receiver_id === userId) {
            console.log('📬 중앙 관제실: 요청 상태 변경!', payload.new);
            decrementRequestCount();
          }
        },
      )
      .subscribe();

    return () => {
      console.log('🎯 중앙 관제실: 실시간 구독 종료');
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(requestChannel);
    };
  }, [userId, queryClient, incrementMessageCount, incrementRequestCount, decrementRequestCount]);
};
