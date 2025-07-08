'use client';

import { profileService } from '@/features/shared/services/profileService';
import type { User } from '@/features/shared/types/User';
import { formatRelativeTime } from '@/utils/dateUtils';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { chatService } from '../services/chatService';
import { ChatRoom } from '../types/chatTypes';

interface ChatListItemProps {
  chatRoom: ChatRoom;
  onClick: () => void;
}

const ChatListItem = ({ chatRoom, onClick }: ChatListItemProps) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const pathname = usePathname();
  const isSelected = pathname.includes(chatRoom.id);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessage, setLastMessage] = useState(chatRoom.lastMessage);
  const [lastMessageTime, setLastMessageTime] = useState(chatRoom.lastMessageTime);
  const [otherUserProfile, setOtherUserProfile] = useState<{
    name: string;
    image: string;
  } | null>(null);

  useEffect(() => {
    const otherUserID = chatRoom.participants.find((id) => id !== userId);
    if (otherUserID) {
      profileService.getProfile(otherUserID).then((profile: User | null) => {
        if (profile) {
          setOtherUserProfile({
            name: profile.name,
            image: profile.image || '',
          });
        }
      });
    }
  }, [chatRoom.participants, userId]);

  useEffect(() => {
    if (!userId) return;

    // 읽지 않은 메시지 수 구독 (Supabase)
    const unsubscribeUnread = chatService.subscribeToUnreadCountSupabase(
      chatRoom.id,
      userId,
      (count) => setUnreadCount(count),
    );

    // 마지막 메시지와 시간 구독 (기존 로직 유지)
    const unsubscribeLastMessage = chatService.subscribeToLastMessage(
      chatRoom.id,
      ({ lastMessage, lastMessageTime }) => {
        setLastMessage(lastMessage);
        setLastMessageTime(lastMessageTime);
      },
    );

    return () => {
      unsubscribeUnread();
      unsubscribeLastMessage();
    };
  }, [chatRoom.id, userId]);

  if (!otherUserProfile) {
    return null;
  }

  return (
    <div
      className={`flex gap-3 px-2 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-gray-200 font-bold' : ''}`}
      onClick={onClick}
    >
      <div className="items-center justify-center flex-shrink-0">
        <Image
          src={otherUserProfile.image || '/default-traveler.png'}
          alt={otherUserProfile.name}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full"
        />
      </div>
      <div className="flex flex-col flex-1">
        <span className="text-gray-900">{otherUserProfile.name}</span>
        <span className="line-clamp-1 text-sm text-gray-700">{lastMessage}</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-gray-500">
          {lastMessageTime
            ? formatRelativeTime(lastMessageTime)
            : formatRelativeTime(chatRoom.createdAt)}
        </span>
        {unreadCount > 0 && (
          <span className="text-sm rounded-full w-5 h-5 text-center text-white bg-orange-400">
            {unreadCount}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatListItem;
