import { chatApiService } from '@/features/chat/services/chatApiService';
import {
  ChatRoomPage,
  DirectChatRoomListItem,
  GatheringChatRoomListItem,
  Message,
} from '@/features/chat/types/chatTypes';
import { useInAppNotification } from '@/features/notifications/hooks/useInAppNotification';
import { profileService } from '@/features/shared/services/profileService';
import { createBrowserSupabaseClient } from '@/lib/supabase-config';
import { useSession } from '@/providers/SessionProvider';
import { useRealtimeStore } from '@/stores/realtimeStore';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

export const useGlobalSubscription = () => {
  const { userId } = useSession();
  const queryClient = useQueryClient();
  const supabase = createBrowserSupabaseClient();
  const { incrementMessageCount, incrementRequestCount, decrementRequestCount } =
    useRealtimeStore();
  const { showChatNotification, showRequestNotification } = useInAppNotification();

  const chatRoomRef = useRef<Map<string, 'direct' | 'group'>>(new Map());

  /*
   * TODO: 향후 성능 최적화 방안
   *
   * 현재 방식: 클라이언트에서 sender 정보를 별도 조회
   * 문제점: N+1 쿼리 문제, 중복 호출, 지연 시간
   *
   * 개선 방안 1: Supabase Database Function + pg_notify
   * - messages 테이블 INSERT 시 트리거 함수 생성
   * - JOIN으로 sender 정보 포함한 payload 생성
   * - pg_notify로 'rich_messages' 채널에 전송
   * - 클라이언트는 'rich_messages' 채널 구독
   *
   * 개선 방안 2: 메시지 테이블 비정규화
   * - messages 테이블에 sender_name, sender_avatar_url 컬럼 추가
   * - INSERT 시점에 sender 정보를 함께 저장
   * - 읽기 성능 극대화, JOIN 불필요
   *
   * 개선 방안 3: Redis 캐시 + 서버 사이드 팬아웃
   * - 서버에서 Redis 캐시로 sender 정보 조회
   * - 비정규화된 payload 생성 후 메시지 큐로 전송
   * - 실시간 워커가 구독자들에게 팬아웃
   */

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

            // TODO: 향후 최적화 - 서버 사이드에서 sender 정보를 포함한 payload 전송
            // 현재는 React Query 캐시를 활용하여 중복 호출 방지
            const fetchSenderInfo = async () => {
              try {
                // ✅ React Query 캐시 활용 - 캐시된 데이터가 있으면 즉시 반환
                const senderProfile = await queryClient.fetchQuery({
                  queryKey: ['profile', rawMessage.sender_id],
                  queryFn: () => profileService.getProfile(rawMessage.sender_id),
                  staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
                });

                showChatNotification({
                  title: senderProfile?.name || 'Someone',
                  message: rawMessage.content,
                  senderName: senderProfile?.name,
                  senderImage: senderProfile?.image,
                  chatRoomId: chatRoomId,
                  roomType: roomType,
                });
              } catch (error) {
                console.error('Failed to fetch sender profile:', error);
                // fallback: sender 정보 없이도 알림 표시
                showChatNotification({
                  title: 'New message',
                  message: rawMessage.content,
                  chatRoomId: chatRoomId,
                  roomType: roomType,
                });
              }
            };

            fetchSenderInfo();
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
          };

          queryClient.setQueryData(
            chatRoomQueryKey,
            (oldData: { pages: ChatRoomPage[] } | undefined) => {
              // 이전 데이터가 없으면 아무것도 하지 않음
              if (!oldData) {
                return oldData;
              }

              // 중복 메시지 방지 (이미 캐시에 메시지가 있으면 업데이트하지 않음)
              const firstPage = oldData.pages?.[0];
              if (!firstPage || !('messages' in firstPage)) {
                return oldData;
              }

              const firstPageMessages = firstPage.messages || [];
              if (firstPageMessages.some((msg: Message) => msg.id === newMessage.id)) {
                return oldData;
              }

              const newData = {
                ...oldData,
                pages: oldData.pages.map((page, index) => {
                  if (index === 0 && 'messages' in page) {
                    return {
                      ...page,
                      messages: [newMessage, ...page.messages],
                    };
                  }
                  return page;
                }),
              };

              return newData;
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

            // TODO: 향후 최적화 - 서버 사이드에서 sender 정보를 포함한 payload 전송
            // 현재는 React Query 캐시를 활용하여 중복 호출 방지
            const fetchRequestSenderInfo = async () => {
              try {
                // ✅ React Query 캐시 활용 - 캐시된 데이터가 있으면 즉시 반환
                const senderProfile = await queryClient.fetchQuery({
                  queryKey: ['profile', payload.new.sender_id],
                  queryFn: () => profileService.getProfile(payload.new.sender_id),
                  staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
                });

                showRequestNotification({
                  title: senderProfile?.name || 'Someone',
                  message: payload.new.message || 'wants to travel with you!',
                  senderName: senderProfile?.name,
                  senderImage: senderProfile?.image,
                  requestId: payload.new.id,
                });
              } catch (error) {
                console.error('Failed to fetch request sender profile:', error);
                // fallback: sender 정보 없이도 알림 표시
                showRequestNotification({
                  title: 'New travel buddy request',
                  message: payload.new.message || 'Someone wants to travel with you!',
                  requestId: payload.new.id,
                });
              }
            };

            fetchRequestSenderInfo();
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
  }, [
    userId,
    queryClient,
    incrementMessageCount,
    incrementRequestCount,
    decrementRequestCount,
    showChatNotification,
    showRequestNotification,
  ]);
};
