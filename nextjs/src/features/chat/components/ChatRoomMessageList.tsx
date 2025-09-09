'use client';

import { useEffect, useRef } from 'react';
import { Message } from '../types/chatTypes';
import ChatRoomDateDivider from './ChatRoomDateDivider';
import ChatRoomMessage from './ChatRoomMessage';
// 확장된 훅을 import 합니다.
import { useVisualViewport } from '@/hooks/useVisualViewport';

interface ChatRoomMessageListProps {
  messages: Message[];
  currentUserID: string;
  onResend: (message: Message) => void;
}

const ChatRoomMessageList = ({ messages, currentUserID, onResend }: ChatRoomMessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // [추가] 스크롤이 되는 컨테이너 div를 가리킬 ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // [핵심 로직] useVisualViewport 훅에 onResize 콜백을 전달
  useVisualViewport(({ delta }) => {
    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;

    // 뷰포트 높이가 줄어들었을 때만 (키보드가 올라왔을 때)
    if (delta < 0) {
      // 줄어든 높이만큼 스크롤 위치를 아래로 이동시킵니다.
      // delta는 음수이므로, 빼주면 양수를 더하는 효과가 납니다. (e.g., scrollTop = scrollTop - (-350))
      const newScrollTop = scrollEl.scrollTop - delta;
      scrollEl.scrollTop = newScrollTop;

      console.log('🔍 [DEBUG] 스크롤 위치 보정:', {
        oldScrollTop: scrollEl.scrollTop + delta,
        newScrollTop,
        delta,
        keyboardHeight: Math.abs(delta),
      });
    }
  });

  // 새 메시지가 왔을 때 맨 아래로 스크롤하는 기존 로직은 그대로 둡니다.
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    // [수정] 스크롤 컨테이너에 ref를 연결합니다.
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-200">
      {Object.entries(messageGroups).map(([date, dateMessages]) => (
        <div key={date}>
          <ChatRoomDateDivider date={date} />
          {dateMessages.map((message) => (
            <ChatRoomMessage
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === currentUserID}
              onResend={onResend}
            />
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatRoomMessageList;
