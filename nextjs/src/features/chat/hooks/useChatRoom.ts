import { useRealtimeStore } from '@/stores/realtimeStore';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { chatApiService } from '../services/chatApiService';
import { ChatRoomPage, ChatRoomUser, Message } from '../types/chatTypes';

interface UseChatRoomProps {
  chatRoomId: string;
  userId: string | null;
}

export const useChatRoom = ({ chatRoomId, userId }: UseChatRoomProps) => {
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  const roomType = useSearchParams().get('type');
  const queryClient = useQueryClient();
  const { setActiveChatRoomId, decrementMessageCountBy } = useRealtimeStore();

  const {
    data: chatRoomData,
    isLoading: isChatRoomLoading,
    isError: isChatRoomError,
    fetchNextPage: fetchNextMessagePage,
    hasNextPage: hasNextMessagesPage,
    isFetchingNextPage: isFetchingNextMessagesPage,
  } = useInfiniteQuery({
    queryKey: ['chatRoom', chatRoomId, roomType],
    queryFn: ({ pageParam }) => {
      if (!pageParam) {
        return roomType === 'direct'
          ? chatApiService.getDirectChatRoomWithInitialMessages(chatRoomId)
          : chatApiService.getGroupChatRoomWithInitialMessages(chatRoomId);
      } else {
        return roomType === 'direct'
          ? chatApiService.getDirectChatMessagesOnly(chatRoomId, pageParam as string)
          : chatApiService.getGatheringChatMessagesOnly(chatRoomId, pageParam as string);
      }
    },
    getNextPageParam: (lastPage: ChatRoomPage) => {
      if ('paginationInfo' in lastPage) {
        return lastPage.paginationInfo?.hasMore ? lastPage.paginationInfo?.nextCursor : undefined;
      }
      return undefined;
    },
    enabled: !!chatRoomId && !!userId && !!roomType,
    staleTime: Infinity,
    initialPageParam: null as string | null,
  });

  // 채팅방 정보는 첫 페이지에서만 추출
  const chatRoomInfo = useMemo(() => {
    if (!chatRoomData?.pages?.[0]) return null;

    const firstPage = chatRoomData.pages[0];
    if (!firstPage) return null;

    // 첫 페이지에서 채팅방 정보만 추출
    if ('paginationInfo' in firstPage) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { messages, paginationInfo, ...chatRoomInfo } = firstPage;
      return chatRoomInfo;
    }
    return firstPage;
  }, [chatRoomData?.pages]);

  // 모든 메시지를 시간순으로 정렬
  const allMessages = useMemo(() => {
    if (!chatRoomData?.pages) return [];

    return chatRoomData.pages
      .flatMap((page) => {
        if ('messages' in page) {
          return page.messages;
        }
        return [];
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [chatRoomData?.pages]);

  const isGroupChat = roomType === 'group';

  // 채팅방 진입/퇴장 시 상태 관리 및 읽음 처리
  useEffect(() => {
    if (!chatRoomId || !userId || !chatRoomInfo) return;

    setActiveChatRoomId(chatRoomId);

    const currentUnreadCount = (chatRoomInfo as { unreadCount?: number })?.unreadCount || 0;

    chatApiService
      .markMessagesAsRead(chatRoomId)
      .then(() => {
        if (currentUnreadCount > 0) {
          decrementMessageCountBy(currentUnreadCount);
        }

        const listQueryKey = isGroupChat
          ? ['gatheringChatRooms', userId]
          : ['directChatRooms', userId];
        queryClient.invalidateQueries({ queryKey: listQueryKey });
      })
      .catch((error) => {
        console.error('Error marking messages as read:', error);
      });

    return () => {
      setActiveChatRoomId(null);
      chatApiService.markMessagesAsRead(chatRoomId);
    };
  }, [
    chatRoomId,
    userId,
    isGroupChat,
    setActiveChatRoomId,
    queryClient,
    decrementMessageCountBy,
    chatRoomInfo,
  ]);

  // 메시지와 임시 메시지 결합
  const combinedMessages = useMemo(() => {
    return [...allMessages, ...pendingMessages];
  }, [allMessages, pendingMessages]);

  // 그룹 채팅의 경우 메시지에 참여자 정보를 미리 조합
  const messagesWithSender = useMemo(() => {
    if (
      !isGroupChat ||
      !chatRoomInfo ||
      !('participantDetails' in chatRoomInfo) ||
      !chatRoomInfo.participantDetails
    ) {
      return combinedMessages;
    }

    // 참여자 정보를 Map으로 변환하여 O(1) 검색 성능 확보
    const participantsMap = new Map(
      (chatRoomInfo.participantDetails as ChatRoomUser[]).map((p: ChatRoomUser) => [p.id, p]),
    );

    return combinedMessages.map((message) => ({
      ...message,
      sender: participantsMap.get(message.senderId),
    }));
  }, [combinedMessages, isGroupChat, chatRoomInfo]);

  // 메시지 전송 (Optimistic UI 포함)
  const sendMessage = async (content: string) => {
    if (!userId || !chatRoomId) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      chatRoomId,
      senderId: userId,
      content,
      timestamp: new Date().toISOString(),
      read: true,
      pending: true,
    };
    setPendingMessages((prev) => [...prev, optimisticMessage]);

    try {
      const sentMessage = await chatApiService.sendMessage(chatRoomId, content);

      if (sentMessage) {
        const chatRoomQueryKey = ['chatRoom', chatRoomId, roomType];
        queryClient.setQueryData(
          chatRoomQueryKey,
          (oldData: { pages: ChatRoomPage[] } | undefined) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              pages: oldData.pages.map((page, index) => {
                if (index === 0 && 'messages' in page) {
                  return {
                    ...page,
                    messages: [sentMessage, ...page.messages],
                  };
                }
                return page;
              }),
            };
          },
        );
        setPendingMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      } else {
        await queryClient.invalidateQueries({ queryKey: ['chatRoom', chatRoomId, roomType] });
        setPendingMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      }
    } catch (error) {
      setPendingMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? { ...msg, pending: false, error: true } : msg)),
      );
    }
  };

  // 메시지 재전송
  const resendMessage = (message: Message) => {
    setPendingMessages((prev) => prev.filter((msg) => msg.id !== message.id));
    sendMessage(message.content);
  };

  return {
    // 상태
    messages: messagesWithSender,
    chatRoom: chatRoomInfo,
    isGroupChat,
    isLoading: isChatRoomLoading,
    isError: isChatRoomError,

    // 무한 스크롤 관련
    fetchNextMessagePage,
    hasNextMessagesPage,
    isFetchingNextMessagesPage,

    // 액션
    sendMessage,
    resendMessage,
  };
};
