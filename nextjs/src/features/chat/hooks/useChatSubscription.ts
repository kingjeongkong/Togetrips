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

// 메시지 구독 훅
interface UseChatMessageSubscriptionProps {
  userId: string | null;
  chatRoomId: string;
  onMessage: (messages: Message[]) => void;
  onError?: (failedCount: number) => void;
}

export const useChatMessageSubscription = ({
  userId,
  chatRoomId,
  onMessage,
  onError,
}: UseChatMessageSubscriptionProps) => {
  useEffect(() => {
    if (!chatRoomId || !userId || !onMessage) return;

    const unsubscribe = chatRealtimeService.subscribeToMessages(
      chatRoomId,
      onMessage,
      onError,
      3,
      userId,
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [chatRoomId, userId, onMessage, onError]);

  return {};
};
