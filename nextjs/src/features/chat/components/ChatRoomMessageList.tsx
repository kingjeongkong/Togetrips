'use client';

import { useVisualViewport } from '@/hooks/useVisualViewport';
import { useEffect, useRef, useState } from 'react';
import { FaArrowDown } from 'react-icons/fa';
import { Message } from '../types/chatTypes';
import ChatRoomDateDivider from './ChatRoomDateDivider';
import ChatRoomMessage from './ChatRoomMessage';

interface ChatRoomMessageListProps {
  messages: (Message & { sender?: { id: string; name: string; image: string } })[];
  currentUserID: string;
  onResend: (message: Message) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

const ChatRoomMessageList = ({
  messages,
  currentUserID,
  onResend,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: ChatRoomMessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // [추가] 스크롤이 되는 컨테이너 div를 가리킬 ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // [추가] 브라우저 대신 우리가 직접 관리할 신뢰할 수 있는 스크롤 위치 저장소
  const lastScrollTopRef = useRef(0);

  const prevScrollHeightRef = useRef<number | null>(null); // 이전 메시지 로딩 전 스크롤 높이 저장
  const isLoadingMoreRef = useRef(false); // 이전 메시지 로딩 중 상태 저장

  // 스크롤 상태 관리
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // [추가] 사용자의 직접적인 스크롤을 감지하여 우리 저장소에 업데이트하는 로직
  useEffect(() => {
    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;

    const handleScroll = () => {
      lastScrollTopRef.current = scrollEl.scrollTop;

      // 맨 위에 도달했을 때의 로직
      if (scrollEl.scrollTop === 0 && hasMore && onLoadMore && !isLoadingMore) {
        // 현재 스크롤 높이를 기록하고, 로딩 상태임을 표시
        prevScrollHeightRef.current = scrollEl.scrollHeight;
        isLoadingMoreRef.current = true;
        onLoadMore();
      }

      // 스크롤 위치에 따라 "최신 메시지로 이동" 버튼 표시/숨김
      const isNearBottom =
        scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 500;
      setShowScrollToBottom(!isNearBottom);
    };

    scrollEl.addEventListener('scroll', handleScroll);
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, [hasMore, onLoadMore, isLoadingMore]);

  // 이전 messages가 추가 로딩되었을 때 스크롤 위치를 조정하는 useEffect
  useEffect(() => {
    const scrollEl = scrollContainerRef.current;
    // 이전 메시지를 로딩 중이었고, 스크롤 요소가 존재할 때만 실행
    if (isLoadingMoreRef.current && scrollEl && prevScrollHeightRef.current !== null) {
      const newScrollHeight = scrollEl.scrollHeight;
      const heightDifference = newScrollHeight - prevScrollHeightRef.current;

      // 스크롤 위치를 정확히 조정
      scrollEl.scrollTop = heightDifference;
      lastScrollTopRef.current = heightDifference;

      // 처리 완료 후 상태 초기화
      isLoadingMoreRef.current = false;
      prevScrollHeightRef.current = null;
    }
  }, [messages]); // messages 배열이 변경될 때마다 실행

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

    // [추가] 렌더링 버그를 해결하기 위한 강제 리페인트(Repaint) 트릭
    // 키보드가 내려가서 컨테이너가 커질 때만 실행합니다.
    if (delta > 0) {
      // transform 속성을 주어 GPU가 이 요소를 다시 그리도록 유도합니다.
      scrollEl.style.transform = 'translateZ(0)';

      // 아주 짧은 시간(50ms) 후에 transform 속성을 다시 제거하여
      // 실제 레이아웃에는 영향을 주지 않도록 합니다.
      setTimeout(() => {
        if (scrollEl) {
          scrollEl.style.transform = 'none';
        }
      }, 50);
    }
  });

  // 초기 로드 시 최하단으로 스크롤
  useEffect(() => {
    if (isInitialLoad && messages.length > 0) {
      const scrollEl = scrollContainerRef.current;
      if (scrollEl) {
        scrollEl.scrollTop = scrollEl.scrollHeight;
        lastScrollTopRef.current = scrollEl.scrollHeight;
        setIsInitialLoad(false);
      }
    }
  }, [messages, isInitialLoad]);

  // 최신 메시지로 이동하는 함수
  const scrollToBottom = () => {
    const scrollEl = scrollContainerRef.current;
    if (scrollEl) {
      scrollEl.scrollTop = scrollEl.scrollHeight;
      lastScrollTopRef.current = scrollEl.scrollHeight;
      setShowScrollToBottom(false);
    }
  };

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
    <div className="relative flex-1 bg-gray-200 overflow-y-hidden">
      <div ref={scrollContainerRef} className="h-full overflow-y-auto p-4">
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <div
              className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"
              aria-label="Loading"
            />
          </div>
        )}

        {Object.entries(messageGroups).map(([date, dateMessages]) => (
          <div key={date}>
            <ChatRoomDateDivider date={date} />
            {dateMessages.map((message) => (
              <ChatRoomMessage
                key={message.id}
                message={message}
                isOwnMessage={message.senderId === currentUserID}
                sender={
                  'sender' in message
                    ? (message.sender as { id: string; name: string; image: string } | undefined)
                    : undefined
                } // sender 정보는 이미 messages에 포함되어 있음
                onResend={onResend}
              />
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 bg-white hover:bg-gray-200 text-gray-900 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105"
          aria-label="Scroll to latest message"
        >
          <FaArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ChatRoomMessageList;
