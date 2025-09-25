import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { chatApiService } from '../services/chatApiService';
import { DirectChatRoom, GatheringChatRoom, Message } from '../types/chatTypes';

interface UseChatRoomProps {
  chatRoomId: string;
  userId: string | null;
}

export const useChatRoom = ({ chatRoomId, userId }: UseChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  const [subscriptionFailed, setSubscriptionFailed] = useState(false);
  const queryClient = useQueryClient();

  // 캐시에서 채팅방 정보 조회
  const chatRoomFromCache = useMemo(() => {
    const directChatRooms = queryClient.getQueryData(['directChatRooms', userId]) as
      | DirectChatRoom[]
      | undefined;
    const gatheringChatRooms = queryClient.getQueryData(['gatheringChatRooms', userId]) as
      | GatheringChatRoom[]
      | undefined;

    const directRoom = directChatRooms?.find((room) => room.id === chatRoomId);
    const gatheringRoom = gatheringChatRooms?.find((room) => room.id === chatRoomId);

    return directRoom || gatheringRoom;
  }, [queryClient, userId, chatRoomId]);

  // API에서 채팅방 정보 조회
  const {
    data: chatRoomFromAPI,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['chatRoom', chatRoomId],
    queryFn: () => chatApiService.getChatRoom(chatRoomId),
    enabled: !chatRoomFromCache && !!chatRoomId && !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const chatRoom = chatRoomFromCache || chatRoomFromAPI;

  // 채팅방 타입 확인 (그룹 채팅인지 1:1 채팅인지)
  const isGroupChat = 'roomName' in (chatRoom || {});

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

  // 메시지 업데이트 핸들러
  const handleMessageUpdate = (newMessages: Message[]) => {
    setMessages(newMessages);
    // 임시 메시지와 DB 메시지 중복 제거
    setPendingMessages((prev) =>
      prev.filter(
        (pending) =>
          !newMessages.some(
            (real) => real.senderId === pending.senderId && real.content === pending.content,
          ),
      ),
    );
  };

  // 구독 에러 핸들러
  const handleSubscriptionError = (failedCount: number) => {
    if (failedCount >= 3) {
      setSubscriptionFailed(true);
    }
  };

  return {
    // 상태
    messages: messagesWithSender,
    chatRoom,
    isGroupChat,
    isLoading,
    isError,
    subscriptionFailed,

    // 액션
    sendMessage,
    resendMessage,

    // 구독 핸들러
    handleMessageUpdate,
    handleSubscriptionError,
  };
};
