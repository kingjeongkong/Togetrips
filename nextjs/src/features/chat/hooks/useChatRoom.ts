import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { chatApiService } from '../services/chatApiService';
import {
  DirectChatRoomApiResponse,
  GatheringChatRoomApiResponse,
  Message,
} from '../types/chatTypes';

interface UseChatRoomProps {
  chatRoomId: string;
  userId: string | null;
}

export const useChatRoom = ({ chatRoomId, userId }: UseChatRoomProps) => {
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  const [subscriptionFailed, setSubscriptionFailed] = useState(false);
  const roomType = useSearchParams().get('type');
  const queryClient = useQueryClient();

  const {
    data: directChatRoomData,
    isLoading: isDirectChatLoading,
    isError: isDirectChatError,
  } = useQuery({
    queryKey: ['directChatRoomWithMessages', chatRoomId],
    queryFn: () => chatApiService.getDirectChatRoomWithMessages(chatRoomId),
    enabled: !!chatRoomId && !!userId && roomType === 'direct',
    staleTime: Infinity,
  });

  const {
    data: groupChatRoomData,
    isLoading: isGroupChatLoading,
    isError: isGroupChatError,
  } = useQuery({
    queryKey: ['groupChatRoomWithMessages', chatRoomId],
    queryFn: () => chatApiService.getGroupChatRoomWithMessages(chatRoomId),
    enabled: !!chatRoomId && !!userId && roomType === 'group',
    staleTime: Infinity,
  });

  const chatRoom: DirectChatRoomApiResponse | GatheringChatRoomApiResponse | undefined =
    directChatRoomData || groupChatRoomData;
  const messages = directChatRoomData?.messages || groupChatRoomData?.messages || [];
  const isGroupChat = roomType === 'group';
  const isLoading = isDirectChatLoading || isGroupChatLoading;

  // 🔽 채팅방 진입 시 읽음 처리 로직 (Direct/Group 분기)
  useEffect(() => {
    if (chatRoom && !isLoading && userId) {
      if (roomType === 'direct') {
        // 1:1 채팅: 기존 로직 사용
        chatApiService
          .markMessagesAsRead(chatRoomId)
          .then(() => {
            console.log(`📬 1:1 채팅방(${chatRoomId}) 메시지를 읽음 처리했습니다.`);
            queryClient.invalidateQueries({ queryKey: ['directChatRooms', userId] });
            queryClient.invalidateQueries({ queryKey: ['unreadCount', userId] });
            queryClient.invalidateQueries({ queryKey: ['directChatRoomWithMessages', chatRoomId] });
          })
          .catch((error) => {
            console.error('1:1 채팅 읽음 처리 중 오류 발생:', error);
          });
      } else if (roomType === 'group') {
        // 그룹 채팅: 새로운 로직 사용
        chatApiService
          .markGroupMessagesAsRead(chatRoomId)
          .then(() => {
            console.log(`📬 그룹 채팅방(${chatRoomId}) 메시지를 읽음 처리했습니다.`);
            queryClient.invalidateQueries({ queryKey: ['gatheringChatRooms', userId] });
            queryClient.invalidateQueries({ queryKey: ['unreadCount', userId] });
            queryClient.invalidateQueries({ queryKey: ['groupChatRoomWithMessages', chatRoomId] });
          })
          .catch((error) => {
            console.error('그룹 채팅 읽음 처리 중 오류 발생:', error);
          });
      }
    }
  }, [chatRoom, isLoading, roomType, chatRoomId, userId, queryClient]);

  // 메시지와 임시 메시지 결합
  const combinedMessages = useMemo(() => {
    return [...messages, ...pendingMessages];
  }, [messages, pendingMessages]);

  // 그룹 채팅의 경우 메시지에 참여자 정보를 미리 조합
  const messagesWithSender = useMemo(() => {
    if (!isGroupChat || !chatRoom || !('participantDetails' in chatRoom)) {
      return combinedMessages;
    }

    // 참여자 정보를 Map으로 변환하여 O(1) 검색 성능 확보
    const participantsMap = new Map(chatRoom.participantDetails.map((p) => [p.id, p]));

    return combinedMessages.map((message) => ({
      ...message,
      sender: participantsMap.get(message.senderId),
    }));
  }, [combinedMessages, isGroupChat, chatRoom]);

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

    const success = await chatApiService.sendMessage(chatRoomId, content);

    if (!success) {
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

  // 새 메시지 핸들러 (React Query 캐시 업데이트)
  const handleNewMessage = useCallback(
    (newMessage: Message) => {
      // React Query 캐시를 직접 업데이트하여 상태 동기화
      const queryKey = isGroupChat
        ? ['groupChatRoomWithMessages', chatRoomId]
        : ['directChatRoomWithMessages', chatRoomId];

      queryClient.setQueryData(
        queryKey,
        (oldData: DirectChatRoomApiResponse | GatheringChatRoomApiResponse | undefined) => {
          if (!oldData) return { messages: [newMessage] };

          // 중복 방지: 이미 존재하는 메시지인지 확인
          const exists = oldData.messages.some((msg: Message) => msg.id === newMessage.id);
          if (exists) return oldData;

          return {
            ...oldData,
            messages: [...oldData.messages, newMessage],
          };
        },
      );

      // 임시 메시지와 DB 메시지 중복 제거
      setPendingMessages((prev) =>
        prev.filter(
          (pending) =>
            !(pending.senderId === newMessage.senderId && pending.content === newMessage.content),
        ),
      );
    },
    [queryClient, chatRoomId],
  );

  // 구독 에러 핸들러
  const handleSubscriptionError = useCallback((failedCount: number) => {
    if (failedCount >= 3) {
      setSubscriptionFailed(true);
    }
  }, []);

  return {
    // 상태
    messages: messagesWithSender,
    chatRoom,
    isGroupChat,
    isLoading: isDirectChatLoading || isGroupChatLoading,
    isError: isDirectChatError || isGroupChatError,
    subscriptionFailed,

    // 액션
    sendMessage,
    resendMessage,

    // 구독 핸들러
    handleNewMessage,
    handleSubscriptionError,
  };
};
