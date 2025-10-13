'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import { useSession } from '@/providers/SessionProvider';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useChatRoom } from '../hooks/useChatRoom';
import { DirectChatRoom, GatheringChatRoom } from '../types/chatTypes';
import ChatRoomHeader from './ChatRoomHeader';
import ChatRoomInput from './ChatRoomInput';
import ChatRoomMessageList from './ChatRoomMessageList';

const ChatRoom = () => {
  const params = useParams();
  const chatRoomID = params.chatRoomID as string;
  const { userId } = useSession();
  const router = useRouter();
  const isKeyboardActiveRef = useRef<boolean>(false); // 키보드 활성화 상태를 저장하기 위한 ref
  const {
    messages,
    chatRoom,
    isGroupChat,
    isLoading,
    isError,
    sendMessage,
    resendMessage,
    fetchNextMessagePage,
    hasNextMessagesPage,
    isFetchingNextMessagesPage,
  } = useChatRoom({ chatRoomId: chatRoomID, userId: userId || null });

  // 키보드 활성화 시 스크롤 제어
  useEffect(() => {
    const handleScroll = () => {
      // 키보드가 활성화된 상태에서 스크롤이 0을 넘어서면(visual viewport 높이를 넘어서면) 무조건 0으로 복귀
      if (isKeyboardActiveRef.current && window.scrollY > 0) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 입력창 포커스/블러 핸들러
  const handleInputFocus = () => {
    // 딜레이를 주어 키보드가 완전히 올라온 후 스크롤 제한 활성화
    setTimeout(() => {
      isKeyboardActiveRef.current = true;
    }, 300);
  };

  const handleInputBlur = () => {
    // 키보드가 내려가면 스크롤 제한을 해제
    isKeyboardActiveRef.current = false;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 bg-red-50">
        <h3 className="text-red-800 font-medium mb-2">Chat room not found</h3>
        <p className="text-red-600 text-sm mb-4">Please go back to the chat list and try again</p>
        <button
          onClick={() => {
            router.push('/chat');
          }}
          className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Back to Chat List
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-hidden">
      <ChatRoomHeader
        image={
          isGroupChat
            ? (chatRoom && 'roomImage' in chatRoom
                ? (chatRoom as GatheringChatRoom).roomImage
                : null) || '/default-traveler.png'
            : (chatRoom && 'otherUser' in chatRoom
                ? (chatRoom as DirectChatRoom).otherUser?.image
                : null) || '/default-traveler.png'
        }
        title={
          isGroupChat
            ? (chatRoom && 'roomName' in chatRoom
                ? (chatRoom as GatheringChatRoom).roomName
                : null) || 'Group Chat'
            : (chatRoom && 'otherUser' in chatRoom
                ? (chatRoom as DirectChatRoom).otherUser?.name
                : null) || ''
        }
        participantCount={
          isGroupChat && chatRoom && 'participantCount' in chatRoom
            ? (chatRoom as GatheringChatRoom).participantCount
            : undefined
        }
        chatRoomId={chatRoomID}
        isGroupChat={isGroupChat}
      />
      <ChatRoomMessageList
        messages={messages}
        currentUserID={userId || ''}
        onResend={resendMessage}
        onLoadMore={fetchNextMessagePage}
        hasMore={hasNextMessagesPage}
        isLoadingMore={isFetchingNextMessagesPage}
      />
      <ChatRoomInput
        onSendMessage={sendMessage}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
    </div>
  );
};

export default ChatRoom;
