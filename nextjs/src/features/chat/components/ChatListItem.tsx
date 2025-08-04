'use client';

import { formatRelativeTime } from '@/utils/dateUtils';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChatRoomListItem } from '../types/chatTypes';

interface ChatListItemProps {
  chatRoom: ChatRoomListItem;
  onClick: () => void;
}

const ChatListItem = ({ chatRoom, onClick }: ChatListItemProps) => {
  const pathname = usePathname();
  const isSelected = pathname.includes(chatRoom.id);

  // otherUser 정보가 없으면 렌더링하지 않음
  if (!chatRoom.otherUser) {
    return null;
  }

  return (
    <div
      className={`flex gap-3 px-2 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-gray-200 font-bold' : ''}`}
      onClick={onClick}
    >
      <div className="items-center justify-center flex-shrink-0">
        <Image
          src={chatRoom.otherUser.image || '/default-traveler.png'}
          alt={chatRoom.otherUser.name}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full"
        />
      </div>
      <div className="flex flex-col flex-1 gap-1">
        <span className="text-gray-900">{chatRoom.otherUser.name}</span>
        <span
          className={`line-lamp-1 text-sm ml-1 text-gray-700 ${
            chatRoom.unreadCount > 0 ? 'font-bold' : ''
          }`}
        >
          {chatRoom.lastMessage}
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-gray-500">
          {chatRoom.lastMessageTime
            ? formatRelativeTime(chatRoom.lastMessageTime)
            : formatRelativeTime(chatRoom.createdAt)}
        </span>
        {chatRoom.unreadCount > 0 && (
          <span className="text-sm rounded-full w-5 h-5 ml-5 text-center text-white bg-orange-400">
            {chatRoom.unreadCount}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatListItem;
