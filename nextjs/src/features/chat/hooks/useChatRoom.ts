import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { chatApiService } from '../services/chatApiService';
import { Message } from '../types/chatTypes';

interface UseChatRoomProps {
  chatRoomId: string;
  userId: string | null;
}

export const useChatRoom = ({ chatRoomId, userId }: UseChatRoomProps) => {
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  const [subscriptionFailed, setSubscriptionFailed] = useState(false);
  const queryClient = useQueryClient();

  // 캐시에서 채팅방 정보 조회
  // const chatRoomFromCache = useMemo(() => {
  //   const directChatRooms = queryClient.getQueryData(['directChatRooms', userId]) as
  //     | DirectChatRoom[]
  //     | undefined;
  //   const gatheringChatRooms = queryClient.getQueryData(['gatheringChatRooms', userId]) as
  //     | GatheringChatRoom[]
  //     | undefined;

  //   const directRoom = directChatRooms?.find((room) => room.id === chatRoomId);
  //   const gatheringRoom = gatheringChatRooms?.find((room) => room.id === chatRoomId);

  //   return directRoom || gatheringRoom;
  // }, [userId, chatRoomId]);

  // 통합된 useQuery: 채팅방 정보와 초기 메시지를 한 번에 가져옵니다
  const {
    data: chatRoomData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['chatRoomWithMessages', chatRoomId],
    queryFn: () => chatApiService.getChatRoomWithMessages(chatRoomId),
    // enabled: !chatRoomFromCache && !!chatRoomId && !!userId,
    enabled: !!chatRoomId && !!userId,
    staleTime: Infinity,
  });

  // 채팅방 정보와 메시지를 분리
  // const chatRoom = chatRoomFromCache || chatRoomData;
  const chatRoom = chatRoomData;
  const messages = chatRoomData?.messages || [];

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
    const participantsMap = new Map(chatRoom.participantDetails.map((p: any) => [p.id, p]));

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

  // 새 메시지 핸들러 (React Query 캐시 업데이트)
  const handleNewMessage = useCallback(
    (newMessage: Message) => {
      // React Query 캐시를 직접 업데이트하여 상태 동기화
      queryClient.setQueryData(['chatRoomWithMessages', chatRoomId], (oldData: any) => {
        if (!oldData) return { messages: [newMessage] };

        // 중복 방지: 이미 존재하는 메시지인지 확인
        const exists = oldData.messages.some((msg: Message) => msg.id === newMessage.id);
        if (exists) return oldData;

        return {
          ...oldData,
          messages: [...oldData.messages, newMessage],
        };
      });

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
    isLoading,
    isError,
    subscriptionFailed,

    // 액션
    sendMessage,
    resendMessage,

    // 구독 핸들러
    handleNewMessage,
    handleSubscriptionError,
  };
};
