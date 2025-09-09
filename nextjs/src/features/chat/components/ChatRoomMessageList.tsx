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

    // [수정] if (delta < 0) 조건을 제거하여 높이가 변경될 때 항상 보정하도록 합니다.
    // 키보드가 올라오면 delta는 음수가 되고, 내려가면 양수가 됩니다.
    // delta를 빼면 키보드가 올라올 때는 스크롤이 아래로, 내려갈 때는 위로 이동하여 현재 위치를 유지합니다.
    const newScrollTop = scrollEl.scrollTop - delta;
    scrollEl.scrollTop = newScrollTop;

    console.log('🔍 [DEBUG] 스크롤 위치 보정:', {
      oldScrollTop: scrollEl.scrollTop + delta,
      newScrollTop,
      delta,
      keyboardHeight: Math.abs(delta),
      direction: delta < 0 ? '키보드 올라옴' : '키보드 내려감',
    });
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
