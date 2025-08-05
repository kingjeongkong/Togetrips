'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import { useSession } from '@/providers/SessionProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { chatService } from '../services/chatService';
import { ChatRoomListItem } from '../types/chatTypes';
import ChatListItem from './ChatListItem';

const ChatList = () => {
  const { userId } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = chatService.subscribeToChatRoomListUpdates(userId, queryClient);
    return () => unsubscribe();
  }, [userId, queryClient]);

  const { data: chatRooms = [], isLoading } = useQuery({
    queryKey: ['chatRooms', userId],
    queryFn: () => chatService.getChatRooms(),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const handleChatClick = (chatRoom: ChatRoomListItem) => {
    if (!chatRoom.otherUser) return;
    router.push(`/chat/${chatRoom.id}`);
  };

  return (
    <div className="flex flex-col h-full" aria-label="Chat list">
      <div className="sticky top-0 z-50 bg-gray-100">
        <h1 className="px-4 py-2 text-xl font-semibold md:px-4 md:py-4 md:text-2xl text-gray-900">
          Messages
        </h1>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-full">
          <LoadingIndicator color="#6366f1" size={50} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto group">
        {chatRooms.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-lg py-10 text-center">
            No chat rooms yet.
          </div>
        ) : (
          chatRooms.map((chatRoom) => (
            <div key={chatRoom.id} aria-label={`Chat room ${chatRoom.id}`}>
              <ChatListItem chatRoom={chatRoom} onClick={() => handleChatClick(chatRoom)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
