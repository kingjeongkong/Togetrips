import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../../../store/useAuthStore';
import { ChatRoom } from '../types/chatTypes';
import { profileService } from '../../../services/profileService';
import { formatRelativeTime } from '../../../../../utils/dateUtils';

interface ChatListItemProps {
  chatRoom: ChatRoom;
  onClick: () => void;
}

const ChatListItem = ({ chatRoom, onClick }: ChatListItemProps) => {
  const user = useAuthStore((state) => state.user);
  const [otherUserProfile, setOtherUserProfile] = useState<{
    name: string;
    photoURL: string;
  } | null>(null);

  useEffect(() => {
    const otherUserID = chatRoom.participants.find((id) => id !== user?.uid);
    if (otherUserID) {
      profileService.getProfile(otherUserID).then((profile) => {
        if (profile) {
          setOtherUserProfile({
            name: profile.name,
            photoURL: profile.photoURL || ''
          });
        }
      });
    }
  }, [chatRoom.participants, user?.uid]);

  if (!otherUserProfile) {
    return null;
  }

  return (
    <div
      className="flex gap-3 px-2 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="items-center justify-center flex-shrink-0">
        <img src={otherUserProfile.photoURL} className="w-12 h-12 rounded-full" />
      </div>
      <div className="flex flex-col flex-1">
        <span>{otherUserProfile.name}</span>
        <span className="line-clamp-1 text-sm text-gray-700">
          {chatRoom.lastMessage || ''}
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-gray-500">
          {chatRoom.lastMessageTime
            ? formatRelativeTime(chatRoom.lastMessageTime)
            : formatRelativeTime(chatRoom.createdAt)}
        </span>
        {/* {unreadMessages > 0 && (
          <span className="text-sm rounded-full w-5 h-5 text-center text-white bg-orange-400">
            {unreadMessages}
          </span>
        )} */}
      </div>
    </div>
  );
};

export default ChatListItem;
