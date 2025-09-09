'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import { useSession } from '@/providers/SessionProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { chatService } from '../services/chatService';
import type { ChatRoom, Message } from '../types/chatTypes';
import ChatRoomHeader from './ChatRoomHeader';
import ChatRoomInput from './ChatRoomInput';
import ChatRoomMessageList from './ChatRoomMessageList';

const ChatRoom = () => {
  const params = useParams();
  const chatRoomID = params.chatRoomID as string;
  const { userId } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]); // 임시 메시지
  const isKeyboardActiveRef = useRef<boolean>(false); // 키보드 활성화 상태를 저장하기 위한 ref
  const [subscriptionFailed, setSubscriptionFailed] = useState(false);

  // [수정] useMemo를 사용하여 messages와 pendingMessages가 변경될 때만
  // 새로운 배열을 생성하도록 합니다.
  const combinedMessages = useMemo(() => {
    return [...messages, ...pendingMessages];
  }, [messages, pendingMessages]);
  const queryClient = useQueryClient();
  const router = useRouter();

  const chatRoomFromCache = useMemo(() => {
    const chatRooms = queryClient.getQueryData(['chatRooms', userId]) as ChatRoom[] | undefined;
    return chatRooms?.find((room) => room.id === chatRoomID);
  }, [queryClient, userId, chatRoomID]);

  const {
    data: chatRoomFromAPI,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['chatRoom', chatRoomID],
    queryFn: () => chatService.getChatRoom(chatRoomID),
    enabled: !chatRoomFromCache && !!chatRoomID && !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const chatRoom = chatRoomFromCache || chatRoomFromAPI;

  // Supabase 실시간 메시지 구독
  useEffect(() => {
    if (!chatRoomID || !userId) return;

    const debouncedMarkAsRead = debounce((roomId: string) => {
      chatService.markMessagesAsRead(roomId).then(() => {
        queryClient.invalidateQueries({ queryKey: ['chatRooms', userId] });
        queryClient.invalidateQueries({ queryKey: ['unreadCount', userId] });
      });
    }, 500);

    const unsubscribe = chatService.subscribeToMessagesSupabase(
      chatRoomID,
      (newMessages) => {
        setMessages(newMessages); // 실제 메시지 전체 갱신
        // 임시 메시지와 DB 메시지 중복 제거
        setPendingMessages((prev) =>
          prev.filter(
            (pending) =>
              !newMessages.some(
                (real) => real.senderId === pending.senderId && real.content === pending.content,
              ),
          ),
        );
        debouncedMarkAsRead(chatRoomID);
      },
      (failedCount) => {
        if (failedCount >= 3) {
          setSubscriptionFailed(true);
        }
      },
      3,
      userId,
    );

    return () => {
      unsubscribe();
      debouncedMarkAsRead.cancel();
    };
  }, [chatRoomID, userId, queryClient]);

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

  const handleSendMessage = async (message: string) => {
    if (!userId || !chatRoomID) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      senderId: userId,
      content: message,
      timestamp: new Date().toISOString(),
      read: true,
      pending: true,
    };
    setPendingMessages((prev) => [...prev, optimisticMessage]);

    const success = await chatService.sendMessage(chatRoomID, message);

    if (!success) {
      setPendingMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? { ...msg, pending: false, error: true } : msg)),
      );
    }
  };

  const handleResend = (message: Message) => {
    setPendingMessages((prev) => prev.filter((msg) => msg.id !== message.id));
    handleSendMessage(message.content);
  };

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

  if (subscriptionFailed) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 bg-red-50">
        <h3 className="text-red-800 font-medium mb-2">Failed to fetch messages</h3>
        <p className="text-red-600 text-sm mb-4">
          Please check your internet connection and try again
        </p>
        <button
          onClick={() => {
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
    <div className="flex flex-col h-full bg-gray-100 overflow-hidden">
      <ChatRoomHeader
        profileImage={chatRoom?.otherUser?.image || '/default-traveler.png'}
        name={chatRoom?.otherUser?.name || ''}
        chatRoomId={chatRoomID}
      />
      <ChatRoomMessageList
        messages={combinedMessages}
        currentUserID={userId || ''}
        onResend={handleResend}
      />
      <ChatRoomInput
        onSendMessage={handleSendMessage}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
    </div>
  );
};

export default ChatRoom;
