import { useNavigate } from 'react-router-dom';
import ChatListItem from '../../../features/Main/section/Chat/components/ChatListItem';

const ChatList = () => {
  const navigate = useNavigate();

  const chatList = [
    {
      id: 1,
      profileImage: 'https://via.placeholder.com/150',
      name: 'Sarah Kim',
      lastMessage:
        'When are you planning to visit Seoul? When are you planning to visit Seoul? When are you planning to visit Seoul?',
      lastMessageTime: '2h',
      unreadMessages: 3
    },
    {
      id: 2,
      profileImage: 'https://via.placeholder.com/150',
      name: 'Mike Johnson',
      lastMessage: 'The restaurant you recommended was amazing!',
      lastMessageTime: '5h',
      unreadMessages: 1
    },
    {
      id: 3,
      profileImage: 'https://via.placeholder.com/150',
      name: 'Emily Davis',
      lastMessage: 'Lets meet at the hotel lobby',
      lastMessageTime: '1d',
      unreadMessages: 0
    },
    {
      id: 4,
      profileImage: 'https://via.placeholder.com/150',
      name: 'David Wilson',
      lastMessage: 'Thanks for the travel tips!',
      lastMessageTime: '2d',
      unreadMessages: 0
    },
    {
      id: 5,
      profileImage: 'https://via.placeholder.com/150',
      name: 'Sarah Kim',
      lastMessage:
        'When are you planning to visit Seoul? When are you planning to visit Seoul? When are you planning to visit Seoul?',
      lastMessageTime: '2h',
      unreadMessages: 3
    },
    {
      id: 6,
      profileImage: 'https://via.placeholder.com/150',
      name: 'Mike Johnson',
      lastMessage: 'The restaurant you recommended was amazing!',
      lastMessageTime: '5h',
      unreadMessages: 1
    },
    {
      id: 7,
      profileImage: 'https://via.placeholder.com/150',
      name: 'Emily Davis',
      lastMessage: 'Lets meet at the hotel lobby',
      lastMessageTime: '1d',
      unreadMessages: 0
    },
    {
      id: 48,
      profileImage: 'https://via.placeholder.com/150',
      name: 'David Wilson',
      lastMessage: 'Thanks for the travel tips!',
      lastMessageTime: '2d',
      unreadMessages: 0
    },
    {
      id: 14,
      profileImage: 'https://via.placeholder.com/150',
      name: 'Sarah Kim',
      lastMessage:
        'When are you planning to visit Seoul? When are you planning to visit Seoul? When are you planning to visit Seoul?',
      lastMessageTime: '2h',
      unreadMessages: 3
    },
    {
      id: 26,
      profileImage: 'https://via.placeholder.com/150',
      name: 'Mike Johnson',
      lastMessage: 'The restaurant you recommended was amazing!',
      lastMessageTime: '5h',
      unreadMessages: 1
    },
    {
      id: 38,
      profileImage: 'https://via.placeholder.com/150',
      name: 'Emily Davis',
      lastMessage: 'Lets meet at the hotel lobby',
      lastMessageTime: '1d',
      unreadMessages: 0
    },
    {
      id: 41,
      profileImage: 'https://via.placeholder.com/150',
      name: 'David Wilson',
      lastMessage: 'Thanks for the travel tips!',
      lastMessageTime: '2d',
      unreadMessages: 0
    },
    {
      id: 11,
      profileImage: 'https://via.placeholder.com/150',
      name: 'Sarah Kim',
      lastMessage:
        'When are you planning to visit Seoul? When are you planning to visit Seoul? When are you planning to visit Seoul?',
      lastMessageTime: '2h',
      unreadMessages: 3
    },
    {
      id: 20,
      profileImage: 'https://via.placeholder.com/150',
      name: 'Mike Johnson',
      lastMessage: 'The restaurant you recommended was amazing!',
      lastMessageTime: '5h',
      unreadMessages: 1
    },
    {
      id: 30,
      profileImage: 'https://via.placeholder.com/150',
      name: 'Emily Davis',
      lastMessage: 'Lets meet at the hotel lobby',
      lastMessageTime: '1d',
      unreadMessages: 0
    },
    {
      id: 40,
      profileImage: 'https://via.placeholder.com/150',
      name: 'David Wilson',
      lastMessage: 'Thanks for the travel tips!',
      lastMessageTime: '2d',
      unreadMessages: 0
    }
  ];

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-50 bg-gray-100">
        <h1 className="px-4 py-2 text-xl font-semibold md:px-4 md:py-4 md:text-2xl">
          Messages
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chatList.map((chat) => (
          <ChatListItem key={chat.id} {...chat} onClick={() => console.log('clicked')} />
        ))}
      </div>
    </div>
  );
};

export default ChatList;
