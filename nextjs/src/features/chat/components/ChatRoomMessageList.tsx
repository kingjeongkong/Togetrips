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

  // [추가] 브라우저 대신 우리가 직접 관리할 신뢰할 수 있는 스크롤 위치 저장소
  const lastScrollTopRef = useRef(0);

  // [추가] 사용자의 직접적인 스크롤을 감지하여 우리 저장소에 업데이트하는 로직
  useEffect(() => {
    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;

    const handleScroll = () => {
      // 사용자가 직접 스크롤하면, 그 위치를 우리 저장소에 기록합니다.
      lastScrollTopRef.current = scrollEl.scrollTop;
    };

    scrollEl.addEventListener('scroll', handleScroll);
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, []);

  // [핵심 로직] useVisualViewport 훅에 onResize 콜백을 전달
  useVisualViewport(({ delta }) => {
    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;

    // [수정] 신뢰할 수 없는 scrollEl.scrollTop 대신, 우리 저장소의 값을 사용합니다.
    const oldScrollTop = lastScrollTopRef.current;
    const newScrollTop = oldScrollTop - delta;

    const finalScrollTop = Math.max(0, newScrollTop);

    // [수정] 스크롤 위치를 설정한 후, 그 값을 즉시 우리 저장소에도 업데이트합니다.
    scrollEl.scrollTop = finalScrollTop;
    lastScrollTopRef.current = finalScrollTop;

    console.log('🔍 [DEBUG] 스크롤 위치 보정:', {
      oldScrollTop,
      newScrollTop,
      finalScrollTop,
      delta,
      keyboardHeight: Math.abs(delta),
      direction: delta < 0 ? '키보드 올라옴' : '키보드 내려감',
    });
  });

  // 새 메시지가 왔을 때의 스크롤 로직은 그대로 유지
  useEffect(() => {
    const scrollEl = scrollContainerRef.current;
    if (scrollEl) {
      scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: 'smooth' });
      // 맨 아래로 이동했으므로 우리 저장소도 업데이트 해줍니다.
      lastScrollTopRef.current = scrollEl.scrollHeight;
    }
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
