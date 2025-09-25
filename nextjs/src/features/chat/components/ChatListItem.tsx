'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

// 범용적인 props 타입을 정의합니다.
interface ChatListItemProps {
  id: string;
  imageUrl: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  participantCount?: number; // 그룹 채팅을 위한 선택적 prop
  onClick: () => void;
}

const ChatListItem = ({
  id,
  imageUrl,
  title,
  lastMessage,
  timestamp,
  unreadCount,
  participantCount,
  onClick,
}: ChatListItemProps) => {
  const pathname = usePathname();
  const isSelected = pathname.includes(id);

  return (
    <div
      className={`flex gap-3 px-2 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-gray-200 font-bold' : ''
      }`}
      onClick={onClick}
    >
      <div className="items-center justify-center flex-shrink-0">
        <Image
          src={imageUrl}
          alt={title}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full"
        />
      </div>
      <div className="flex flex-col flex-1 gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-gray-900 truncate">{title}</span>
          {participantCount && (
            <span className="text-xs text-gray-500 flex-shrink-0">({participantCount})</span>
          )}
        </div>
        <span
          className={`truncate text-sm ml-1 text-gray-700 ${unreadCount > 0 ? 'font-bold' : ''}`}
        >
          {lastMessage}
        </span>
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className="text-sm text-gray-500 whitespace-nowrap">{timestamp}</span>
        {unreadCount > 0 && (
          <span className="text-sm rounded-full w-5 h-5 flex items-center justify-center text-white bg-orange-400">
            {unreadCount}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatListItem;
