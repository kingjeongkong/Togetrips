import { useParams } from 'react-router-dom';
import ChatRoomHeader from './ChatRoomHeader';
import ChatRoomInput from './ChatRoomInput';
import ChatRoomMessageList from './ChatRoomMessageList';
import { useAuthStore } from '../../../../../store/useAuthStore';
import { useEffect, useState } from 'react';
import { Message } from '../types/chatTypes';
import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services/chatService';
import { profileService } from '../../../services/profileService';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import { toast } from 'react-toastify';

const ChatRoom = () => {
  const { chatRoomID } = useParams<{ chatRoomID: string }>();
  const user = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [subscriptionFailed, setSubscriptionFailed] = useState(false);

  // Fetch Chat Room data
  const { data: chatRoomData, isLoading: isLoadingRoom } = useQuery({
    queryKey: ['chatRoom', chatRoomID],
    queryFn: () => chatService.getChatRoom(chatRoomID!),
    enabled: !!chatRoomID,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

  // Fetch other user's profile
  const { data: otherUserProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', chatRoomData?.participants.find((id) => id !== user?.uid)],
    queryFn: async () => {
      const otherUserID = chatRoomData?.participants.find((id) => id !== user?.uid);
      if (!otherUserID) return null;

      return profileService.getProfile(otherUserID);
    },
    enabled: !!chatRoomData && !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

  // 실시간 메시지 구독
  useEffect(() => {
    if (!chatRoomID || !user) return;

    // ChatRoom 입장 시 메시지 읽음 update
    chatService.markMessagesAsRead(chatRoomID, user.uid);

    const unsubscribe = chatService.subscribeToMessages(
      chatRoomID,
      (messages) => {
        setMessages(messages);
      },
      (failedCount) => {
        toast.error('Failed to fetch messages');

        if (failedCount >= 3) {
          setSubscriptionFailed(true);
        }
      }
    );

    return () => unsubscribe();
  }, [chatRoomID, user]);

  const handleSendMessage = async (message: string) => {
    if (!user || !chatRoomID) return;

    await chatService.sendMessage(chatRoomID, user.uid, message);
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
        profileImage={otherUserProfile?.photoURL || ''}
        name={otherUserProfile?.name || ''}
      />
      <ChatRoomMessageList messages={messages} currentUserID={user?.uid || ''} />
      <ChatRoomInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatRoom;
