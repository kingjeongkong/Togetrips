import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { formatRelativeTime } from '../../../utils/dateUtils';
import { profileService } from '../../shared/services/profileService';
import { chatService } from '../services/chatService';
import { ChatRoom } from '../types/chatTypes';

interface ChatListItemProps {
  chatRoom: ChatRoom;
  onClick: () => void;
}

const ChatListItem = ({ chatRoom, onClick }: ChatListItemProps) => {
  const user = useAuthStore((state) => state.user);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessage, setLastMessage] = useState(chatRoom.lastMessage);
  const [lastMessageTime, setLastMessageTime] = useState(chatRoom.lastMessageTime);
  const [otherUserProfile, setOtherUserProfile] = useState<{
    name: string;
    image: string;
  } | null>(null);

  useEffect(() => {
    const otherUserID = chatRoom.participants.find((id) => id !== user?.uid);
    if (otherUserID) {
      profileService.getProfile(otherUserID).then((profile) => {
        if (profile) {
          setOtherUserProfile({
            name: profile.name,
            image: profile.image || ''
          });
        }
      });
    }
  }, [chatRoom.participants, user?.uid]);

  useEffect(() => {
    if (!user) return;

    // 읽지 않은 메시지 수 구독
    const unsubscribeUnread = chatService.subscribeToUnreadCount(
      chatRoom.id,
      user.uid,
      (count) => setUnreadCount(count)
    );

    // 마지막 메시지와 시간 구독
    const unsubscribeLastMessage = chatService.subscribeToLastMessage(
      chatRoom.id,
      ({ lastMessage, lastMessageTime }) => {
        setLastMessage(lastMessage);
        setLastMessageTime(lastMessageTime);
      }
    );

    return () => {
      unsubscribeUnread();
      unsubscribeLastMessage();
    };
  }, [chatRoom.id, user?.uid]);

  if (!otherUserProfile) {
    return null;
  }

  return (
    <div
      className="flex gap-3 px-2 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="items-center justify-center flex-shrink-0">
        <img src={otherUserProfile.image} className="w-12 h-12 rounded-full" />
      </div>
      <div className="flex flex-col flex-1">
        <span>{otherUserProfile.name}</span>
        <span className="line-clamp-1 text-sm text-gray-700">
          {lastMessage}
        </span>
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
