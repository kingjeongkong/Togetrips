import { chatApiService } from '@/features/chat/services/chatApiService';
import {
  DirectChatRoomApiResponse,
  DirectChatRoomListItem,
  GatheringChatRoomApiResponse,
  GatheringChatRoomListItem,
  Message,
} from '@/features/chat/types/chatTypes';
import { supabase } from '@/lib/supabase-config';
import { useSession } from '@/providers/SessionProvider';
import { useRealtimeStore } from '@/stores/realtimeStore';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

export const useGlobalSubscription = () => {
  const { userId } = useSession();
  const queryClient = useQueryClient();
  const { incrementMessageCount, incrementRequestCount, decrementRequestCount } =
    useRealtimeStore();

  const chatRoomRef = useRef<Map<string, 'direct' | 'group'>>(new Map());

  useEffect(() => {
    if (!userId) return;

    const fetchUserChatRooms = async () => {
      const userChatRoomsMap = await chatApiService.getMyChatRoomInfo();
      chatRoomRef.current = userChatRoomsMap;
    };

    fetchUserChatRooms();

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

          const roomType = chatRoomRef.current.get(chatRoomId);
          if (!roomType) {
            return;
          }

          const currentActiveRoomId = useRealtimeStore.getState().activeChatRoomId;
          const isViewingCurrentRoom = chatRoomId === currentActiveRoomId;

          if (!isViewingCurrentRoom) {
            incrementMessageCount();
          }

          const chatListQueryKey =
            roomType === 'direct' ? ['directChatRooms', userId] : ['gatheringChatRooms', userId];

          queryClient.setQueryData(
            chatListQueryKey,
            (oldData: DirectChatRoomListItem[] | GatheringChatRoomListItem[] | undefined) => {
              if (!oldData) return oldData;

              let targetRoom: DirectChatRoomListItem | GatheringChatRoomListItem | null = null;
              const otherRooms = oldData.filter((room) => {
                if (room.id === chatRoomId) {
                  targetRoom = room;
                  return false;
                }
                return true;
              });

              if (!targetRoom) return oldData;

              const updatedRoom =
                roomType === 'direct'
                  ? ({
                      ...(targetRoom as DirectChatRoomListItem),
                      lastMessage: rawMessage.content,
                      lastMessageTime: rawMessage.timestamp,
                      unreadCount: isViewingCurrentRoom
                        ? (targetRoom as DirectChatRoomListItem).unreadCount
                        : ((targetRoom as DirectChatRoomListItem).unreadCount || 0) + 1,
                    } as DirectChatRoomListItem)
                  : ({
                      ...(targetRoom as GatheringChatRoomListItem),
                      lastMessage: rawMessage.content,
                      lastMessageTime: rawMessage.timestamp,
                      unreadCount: isViewingCurrentRoom
                        ? (targetRoom as GatheringChatRoomListItem).unreadCount
                        : ((targetRoom as GatheringChatRoomListItem).unreadCount || 0) + 1,
                    } as GatheringChatRoomListItem);

              return [updatedRoom, ...otherRooms];
            },
          );

          const chatRoomQueryKey = ['chatRoom', chatRoomId, roomType];

          const newMessage: Message = {
            id: rawMessage.id,
            chatRoomId: rawMessage.chat_room_id,
            senderId: rawMessage.sender_id,
            content: rawMessage.content,
            timestamp: rawMessage.timestamp,
            read: rawMessage.read,
          };

          queryClient.setQueryData(
            chatRoomQueryKey,
            (oldData: DirectChatRoomApiResponse | GatheringChatRoomApiResponse | undefined) => {
              if (!oldData || oldData.messages?.some((msg: Message) => msg.id === newMessage.id)) {
                return oldData;
              }
              return { ...oldData, messages: [...(oldData.messages || []), newMessage] };
            },
          );
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
