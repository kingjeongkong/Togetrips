'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import { profileService } from '@/features/shared/services/profileService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { chatService } from '../services/chatService';
import { Message } from '../types/chatTypes';
import ChatRoomHeader from './ChatRoomHeader';
import ChatRoomInput from './ChatRoomInput';
import ChatRoomMessageList from './ChatRoomMessageList';

const ChatRoom = () => {
  const params = useParams();
  const chatRoomID = params.chatRoomID as string;
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [messages, setMessages] = useState<Message[]>([]);
  const [subscriptionFailed, setSubscriptionFailed] = useState(false);
  const queryClient = useQueryClient();

  // Fetch Chat Room data
  const { data: chatRoomData, isLoading: isLoadingRoom } = useQuery({
    queryKey: ['chatRoom', chatRoomID],
    queryFn: () => chatService.getChatRoom(chatRoomID),
    enabled: !!chatRoomID,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Fetch other user's profile
  const { data: otherUserProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', chatRoomData?.participants.find((id) => id !== userId)],
    queryFn: async () => {
      const otherUserID = chatRoomData?.participants.find((id) => id !== userId);
      if (!otherUserID) return null;

      return profileService.getProfile(otherUserID);
    },
    enabled: !!chatRoomData && !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Supabase 실시간 메시지 구독
  useEffect(() => {
    if (!chatRoomID || !userId) return;

    // ChatRoom 입장 시 메시지 읽음 update
    chatService.markMessagesAsRead(chatRoomID).then(() => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms', userId] });
    });

    const unsubscribe = chatService.subscribeToMessagesSupabase(
      chatRoomID,
      (messages) => {
        setMessages(messages);
      },
      (failedCount) => {
        if (failedCount >= 3) {
          setSubscriptionFailed(true);
        }
      },
      3,
      session,
    );

    return () => unsubscribe();
  }, [chatRoomID, userId, session, queryClient]);

  const handleSendMessage = async (message: string) => {
    if (!userId || !chatRoomID) return;

    const success = await chatService.sendMessage(chatRoomID, message);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['chatRooms', userId] });
    }
  };

  if (isLoadingRoom || isLoadingProfile) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingIndicator color="#6366f1" size={50} />
      </div>
    );
  }

  if (subscriptionFailed) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 bg-red-50">
        <h3 className="text-red-800 font-medium mb-2">Failed to fetch messages</h3>
        <p className="text-red-600 text-sm mb-4">
          Please check your internet connection and try again
        </p>
        <button
          onClick={() => {
            // 페이지 새로고침으로 재시도
            window.location.reload();
          }}
          className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatRoomHeader
        profileImage={otherUserProfile?.image || ''}
        name={otherUserProfile?.name || ''}
      />
      <ChatRoomMessageList messages={messages} currentUserID={userId || ''} />
      <ChatRoomInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatRoom;
