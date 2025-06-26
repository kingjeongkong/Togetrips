import { Message } from '../types/chatTypes';

interface ChatRoomMessageProps {
  message: Message;
  isOwnMessage: boolean;
}

const ChatRoomMessage = ({ message, isOwnMessage }: ChatRoomMessageProps) => {
  return (
    <div className={`flex gap-1 ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`text-xs flex items-end pb-1 text-gray-600 ${isOwnMessage ? 'order-1' : 'order-2'}`}
      >
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
      <div
        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
          isOwnMessage ? 'bg-indigo-500 text-white order-2' : 'bg-white text-black order-1'
        }`}
      >
        <p>{message.content}</p>
      </div>
    </div>
  );
};

export default ChatRoomMessage;
