import { useNavigate } from 'react-router-dom';
import ChatListItem from './ChatListItem';
import { chatService } from '../services/chatService';
import { useAuthStore } from '../../../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import LoadingIndicator from '../../../components/LoadingIndicator';

const ChatList = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const { data: chatRooms = [], isLoading } = useQuery({
    queryKey: ['chatRooms', user?.uid],
    queryFn: () => chatService.getChatRooms(user!.uid),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

  const handleChatClick = (chatRoomID: string) => {
    navigate(`/chat/${chatRoomID}`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-50 bg-gray-100">
        <h1 className="px-4 py-2 text-xl font-semibold md:px-4 md:py-4 md:text-2xl">
          Messages
        </h1>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-full">
          <LoadingIndicator color="#6366f1" size={50} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {chatRooms.map((chatRoom) => (
          <ChatListItem
            key={chatRoom.id}
            chatRoom={chatRoom}
            onClick={() => handleChatClick(chatRoom.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatList;
