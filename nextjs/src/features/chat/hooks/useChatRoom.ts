import { useRealtimeStore } from '@/stores/realtimeStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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
  const { setActiveChatRoomId, decrementMessageCountBy } = useRealtimeStore();

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

  // 채팅방 진입/퇴장 시 상태 관리 및 읽음 처리
  useEffect(() => {
    if (!chatRoomId || !userId || !chatRoom) return;

    setActiveChatRoomId(chatRoomId);

    const currentUnreadCount = chatRoom?.unreadCount || 0;

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
    chatRoom,
  ]);

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
  };
};
