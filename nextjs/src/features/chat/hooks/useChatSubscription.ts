import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { chatRealtimeService } from '../services/chatRealtimeService';
import { Message } from '../types/chatTypes';

// 채팅방 목록 구독 훅
interface UseChatRoomListSubscriptionProps {
  userId: string | null;
}

export const useChatRoomListSubscription = ({ userId }: UseChatRoomListSubscriptionProps) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = chatRealtimeService.subscribeToChatRoomListUpdates(userId, queryClient);
    return () => unsubscribe();
  }, [userId, queryClient]);

  return {};
};

// 새 메시지 구독 훅
interface UseChatMessageSubscriptionProps {
  userId: string | null;
  chatRoomId: string;
  onNewMessage: (newMessage: Message) => void;
  onError?: (failedCount: number) => void;
}

export const useChatMessageSubscription = ({
  userId,
  chatRoomId,
  onNewMessage,
  onError,
}: UseChatMessageSubscriptionProps) => {
  useEffect(() => {
    if (!chatRoomId || !userId || !onNewMessage) return;

    const unsubscribe = chatRealtimeService.subscribeToNewMessages(
      chatRoomId,
      onNewMessage,
      onError,
      3,
      userId,
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [chatRoomId, userId, onNewMessage, onError]);

  return {};
};
