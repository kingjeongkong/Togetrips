import { Message } from '../types/chatTypes';
import ChatRoomMessage from './ChatRoomMessage';

interface ChatRoomMessageProps {
  messages: Message[];
  currentUserID: string;
}

const ChatRoomMessageList = ({ messages, currentUserID }: ChatRoomMessageProps) => {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 bg-gray-200">
      {messages.map((message) => (
        <ChatRoomMessage
          key={message.id}
          text={message.content}
          time={message.timestamp}
          isMine={message.senderID === currentUserID}
        />
      ))}
    </div>
  );
};

export default ChatRoomMessageList;
