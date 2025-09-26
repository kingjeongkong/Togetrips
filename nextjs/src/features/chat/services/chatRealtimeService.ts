import { supabase } from '@/lib/supabase-config';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { QueryClient } from '@tanstack/react-query';
import { DirectChatRoomListItem, Message } from '../types/chatTypes';

// 헬퍼 함수: DB row를 Message 타입으로 변환
const mapRowToMessage = (row: Record<string, unknown>): Message => ({
  id: row.id as string,
  senderId: row.sender_id as string,
  content: row.content as string,
  timestamp: row.timestamp as string,
  read: row.read as boolean,
});

export const chatRealtimeService = {
  // Supabase Realtime 새 메시지 구독
  subscribeToNewMessages(
    chatRoomID: string,
    onNewMessage: (newMessage: Message) => void,
    onError?: (failedCount: number) => void,
    maxRetries = 3,
    userId?: string,
  ) {
    let failedCount = 0;
    let channel: RealtimeChannel;
    let isSubscribed = true;

    // 인증 상태 확인
    const checkAuth = () => {
      if (!userId) {
        throw new Error('Authentication required');
      }
      return { user: { id: userId } };
    };

    // 실시간 구독 설정 (INSERT만 처리)
    const setupSubscription = async () => {
      try {
        channel = supabase
          .channel(`messages:${chatRoomID}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `chat_room_id=eq.${chatRoomID}`,
            },
            (payload: Record<string, unknown>) => {
              if (!isSubscribed) return;
              try {
                const { new: row } = payload as { new: Record<string, unknown> };
                const newMessage = mapRowToMessage(row);
                onNewMessage(newMessage);
              } catch (error) {
                console.error('Error processing realtime change:', error);
                failedCount++;
                onError?.(failedCount);
              }
            },
          )
          .subscribe((status) => {
            if (status === 'CHANNEL_ERROR' && isSubscribed && failedCount < maxRetries) {
              console.error('Channel error occurred, attempting to reconnect...');
              failedCount++;
              onError?.(failedCount);
              setTimeout(() => {
                if (isSubscribed) {
                  channel.unsubscribe();
                  setupSubscription().catch((error) => {
                    console.error('Failed to reconnect:', error);
                    failedCount++;
                    onError?.(failedCount);
                  });
                }
              }, 1000 * failedCount);
            } else if (status === 'CHANNEL_ERROR' && failedCount >= maxRetries) {
              console.error('Max retries reached, stopping reconnection attempts');
              onError?.(failedCount);
            }
          });
      } catch (error) {
        console.error('Error setting up subscription:', error);
        failedCount++;
        onError?.(failedCount);
        throw error;
      }
    };

    // 순차 실행: 인증 → 구독
    (async () => {
      try {
        checkAuth(); // 파라미터로 인증 확인
        await setupSubscription();
      } catch (error) {
        console.error('Failed to initialize chat subscription:', error);
        failedCount++;
        onError?.(failedCount);
      }
    })();

    // 구독 해제 함수 반환
    return () => {
      isSubscribed = false;
      if (channel) {
        channel.unsubscribe();
      }
    };
  },

  // 채팅방 목록 실시간 갱신 구독 (Optimistic Updates)
  subscribeToChatRoomListUpdates(userId: string, queryClient: QueryClient): () => void {
    // Optimistic Updates: 특정 채팅방만 선택적으로 업데이트
    const updateChatRoomOptimistically = (
      chatRoomId: string,
      updates: Partial<DirectChatRoomListItem>,
    ) => {
      queryClient.setQueryData(
        ['directChatRooms', userId],
        (oldData: DirectChatRoomListItem[] | undefined) => {
          if (!oldData) return oldData;

          return oldData.map((room) => (room.id === chatRoomId ? { ...room, ...updates } : room));
        },
      );
    };

    // 사용자의 채팅방만 필터링하는 함수
    const isUserChatRoom = (chatRoomId: string, oldData: DirectChatRoomListItem[] | undefined) => {
      if (!oldData) return false;
      const targetRoom = oldData.find((room) => room.id === chatRoomId);
      return targetRoom?.participants.includes(userId) || false;
    };

    const channel: RealtimeChannel = supabase
      .channel('chat_rooms_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const chatRoomId = payload.new.chat_room_id as string;
          const content = payload.new.content as string;
          const timestamp = payload.new.timestamp as string;
          const senderId = payload.new.sender_id as string;

          // 사용자의 채팅방인지 확인
          const currentData = queryClient.getQueryData(['directChatRooms', userId]) as
            | DirectChatRoomListItem[]
            | undefined;
          if (!isUserChatRoom(chatRoomId, currentData)) return;

          // 현재 채팅방 정보 찾기
          const currentRoom = currentData?.find((room) => room.id === chatRoomId);
          if (!currentRoom) return;

          // 새 메시지: lastMessage, lastMessageTime, unreadCount 업데이트
          updateChatRoomOptimistically(chatRoomId, {
            lastMessage: content,
            lastMessageTime: timestamp,
            unreadCount:
              senderId === userId ? currentRoom.unreadCount : currentRoom.unreadCount + 1,
          });
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const chatRoomId = payload.new.chat_room_id as string;
          const read = payload.new.read as boolean;
          const oldRead = payload.old?.read as boolean;

          // 사용자의 채팅방인지 확인
          const currentData = queryClient.getQueryData(['directChatRooms', userId]) as
            | DirectChatRoomListItem[]
            | undefined;
          if (!isUserChatRoom(chatRoomId, currentData)) return;

          // 읽음 처리: unreadCount만 업데이트
          if (read !== oldRead && read === true) {
            const currentRoom = currentData?.find((room) => room.id === chatRoomId);
            if (!currentRoom) return;

            updateChatRoomOptimistically(chatRoomId, {
              unreadCount: Math.max(0, currentRoom.unreadCount - 1),
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
