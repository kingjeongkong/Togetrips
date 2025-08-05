import { supabase } from '@/lib/supabase-config';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { QueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ChatRoom, ChatRoomListItem, Message } from '../types/chatTypes';

// 헬퍼 함수: DB row를 Message 타입으로 변환
const mapRowToMessage = (row: Record<string, unknown>): Message => ({
  id: row.id as string,
  senderId: row.sender_id as string,
  content: row.content as string,
  timestamp: row.timestamp as string,
  read: row.read as boolean,
});

export const chatService = {
  // 채팅방 목록 조회
  async getChatRooms(): Promise<ChatRoomListItem[]> {
    try {
      const response = await fetch('/api/chat/rooms', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch chat rooms');
      }

      const result = await response.json();
      return result.chatRooms.map((room: Record<string, unknown>) => ({
        id: room.id,
        participants: room.participants,
        createdAt: room.created_at,
        lastMessage: room.last_message || '',
        lastMessageTime: room.last_message_time || room.created_at,
        unreadCount: room.unreadCount ?? 0,
        otherUser: room.otherUser || null,
      }));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching chat rooms:', error);
      }
      toast.error('Failed to fetch chat rooms');
      return [];
    }
  },

  // 개별 채팅방 조회
  async getChatRoom(chatRoomID: string): Promise<Partial<ChatRoom>> {
    try {
      const response = await fetch(`/api/chat/rooms/${chatRoomID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch chat room');
      }

      const room = await response.json();
      return {
        id: room.id,
        participants: room.participants,
        otherUser: room.otherUser || null,
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching chat room:', error);
      }
      toast.error('Failed to fetch chat room');
      throw error;
    }
  },

  // 메시지 읽음 처리
  async markMessagesAsRead(chatRoomID: string, retries = 3): Promise<void> {
    try {
      const response = await fetch('/api/chat/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatRoomID,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark messages as read');
      }

      const result = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log(`Marked ${result.updatedCount} messages as read`);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error marking messages as read:', error);
      }

      if (retries > 0) {
        setTimeout(() => {
          this.markMessagesAsRead(chatRoomID, retries - 1);
        }, 500);
      }
    }
  },

  // 메시지 전송
  async sendMessage(chatRoomID: string, content: string): Promise<boolean> {
    try {
      const response = await fetch('/api/chat/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatRoomID,
          content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error sending message:', error);
      }
      toast.error('Failed to send message');
      return false;
    }
  },

  // Supabase Realtime 메시지 구독 (userId 파라미터로 인증)
  // ToDo : Supabase access token 인증 로직 추가 후 rls 삭제
  subscribeToMessagesSupabase(
    chatRoomID: string,
    onMessage: (messages: Message[]) => void,
    onError?: (failedCount: number) => void,
    maxRetries = 3,
    userId?: string,
  ) {
    let failedCount = 0;
    let currentMessages: Message[] = [];
    let channel: RealtimeChannel;
    let isSubscribed = true;

    // 인증 상태 확인 (파라미터로 전달)
    const checkAuth = () => {
      if (!userId) {
        throw new Error('Authentication required');
      }
      return { user: { id: userId } };
    };

    // 초기 메시지 로딩 (최근 50개만 로드)
    const loadInitialMessages = async () => {
      try {
        const { data: messages, error } = await supabase
          .from('messages')
          .select('id, sender_id, content, timestamp, read')
          .eq('chat_room_id', chatRoomID)
          .order('timestamp', { ascending: true })
          .limit(50);

        if (error) throw error;

        currentMessages = messages?.map(mapRowToMessage) || [];
        onMessage(currentMessages);
      } catch (error) {
        console.error('Error loading initial messages:', error);
        failedCount++;
        onError?.(failedCount);
        throw error;
      }
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
                // 새 메시지 추가만 처리
                const newMessage = mapRowToMessage(row);
                currentMessages = [...currentMessages, newMessage];
                // 타임스탬프 순서 정렬 (안전장치)
                currentMessages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
                onMessage(currentMessages);
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

    // 순차 실행: 인증 → 초기 로딩 → 구독
    (async () => {
      try {
        checkAuth(); // 파라미터로 인증 확인
        await loadInitialMessages();
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

  /**
   * Supabase Realtime을 이용한 채팅방 목록 실시간 갱신 구독 (Optimistic Updates)
   * @param userId 사용자 ID
   * @param queryClient React Query의 QueryClient 인스턴스
   * @returns 구독 해제 함수
   */
  subscribeToChatRoomListUpdates(userId: string, queryClient: QueryClient): () => void {
    // Optimistic Updates: 특정 채팅방만 선택적으로 업데이트
    const updateChatRoomOptimistically = (
      chatRoomId: string,
      updates: Partial<ChatRoomListItem>,
    ) => {
      queryClient.setQueryData(['chatRooms', userId], (oldData: ChatRoomListItem[] | undefined) => {
        if (!oldData) return oldData;

        return oldData.map((room) => (room.id === chatRoomId ? { ...room, ...updates } : room));
      });
    };

    // 사용자의 채팅방만 필터링하는 함수
    const isUserChatRoom = (chatRoomId: string, oldData: ChatRoomListItem[] | undefined) => {
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
          const currentData = queryClient.getQueryData(['chatRooms', userId]) as
            | ChatRoomListItem[]
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
          const currentData = queryClient.getQueryData(['chatRooms', userId]) as
            | ChatRoomListItem[]
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

  async deleteChatRoom(chatRoomId: string): Promise<void> {
    const response = await fetch(`/api/chat/rooms/${chatRoomId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete chat room');
    }
  },
};
