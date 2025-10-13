'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import { useSession } from '@/providers/SessionProvider';
import { formatRelativeTime } from '@/utils/dateUtils';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { chatApiService } from '../services/chatApiService';
import ChatListItem from './ChatListItem';

type TabType = 'chats' | 'groups';

const ChatList = () => {
  const { userId } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('chats');

  const { data: directChatRooms = [], isLoading: isLoadingDirect } = useQuery({
    queryKey: ['directChatRooms', userId],
    queryFn: () => chatApiService.getDirectChatRooms(),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: gatheringChatRooms = [], isLoading: isLoadingGathering } = useQuery({
    queryKey: ['gatheringChatRooms', userId],
    queryFn: () => chatApiService.getGatheringChatRooms(),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-hidden" aria-label="Chat list">
      <div className="flex-shrink-0 bg-gray-100">
        <div className="flex items-center px-4 py-2 md:px-4 md:py-4">
          <button
            onClick={() => {
              if (window.history.length <= 2) {
                router.push('/home');
              } else {
                router.back();
              }
            }}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors mr-2 md:hidden"
            aria-label="Go back"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold md:text-2xl text-gray-900">Messages</h1>
        </div>

        {/* 탭바 */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'chats'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Chats
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'groups'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Groups
          </button>
        </div>
      </div>

      {/* Chats 탭 */}
      {activeTab === 'chats' && (
        <>
          {isLoadingDirect ? (
            <div className="flex justify-center items-center h-full">
              <LoadingIndicator color="#6366f1" size={50} />
            </div>
          ) : directChatRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-lg py-10 text-center">
              No direct messages yet.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto group">
              {directChatRooms.map((chatRoom) => {
                if (!chatRoom.otherUser) return null;

                return (
                  <div key={chatRoom.id} aria-label={`Direct chat room ${chatRoom.id}`}>
                    <ChatListItem
                      id={chatRoom.id}
                      imageUrl={chatRoom.otherUser.image || '/default-traveler.png'}
                      title={chatRoom.otherUser.name}
                      lastMessage={chatRoom.lastMessage || 'No messages yet'}
                      timestamp={formatRelativeTime(chatRoom.lastMessageTime || chatRoom.createdAt)}
                      unreadCount={chatRoom.unreadCount}
                      onClick={() => router.push(`/chat/${chatRoom.id}?type=direct`)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Groups 탭 */}
      {activeTab === 'groups' && (
        <>
          {isLoadingGathering ? (
            <div className="flex justify-center items-center h-full">
              <LoadingIndicator color="#6366f1" size={50} />
            </div>
          ) : gatheringChatRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-lg py-10 text-center">
              No gathering chats yet.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto group">
              {gatheringChatRooms.map((chatRoom) => {
                return (
                  <div key={chatRoom.id} aria-label={`Gathering chat room ${chatRoom.id}`}>
                    <ChatListItem
                      id={chatRoom.id}
                      imageUrl={chatRoom.roomImage || '/default-traveler.png'}
                      title={chatRoom.roomName}
                      lastMessage={chatRoom.lastMessage || 'No messages yet'}
                      timestamp={
                        chatRoom.lastMessageTime
                          ? formatRelativeTime(chatRoom.lastMessageTime)
                          : 'New'
                      }
                      unreadCount={chatRoom.unreadCount}
                      participantCount={chatRoom.participantCount}
                      onClick={() => router.push(`/chat/${chatRoom.id}?type=group`)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatList;
