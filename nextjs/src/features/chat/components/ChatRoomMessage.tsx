import { Message } from '../types/chatTypes';

interface ChatRoomMessageProps {
  message: Message;
  isOwnMessage: boolean;
}

const ChatRoomMessage = ({ message, isOwnMessage }: ChatRoomMessageProps) => {
  const messageTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      aria-label={`${isOwnMessage ? 'My message' : 'Other message'} at ${messageTime}: ${message.content}`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwnMessage
            ? 'bg-indigo-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
        aria-label={`Message sent at ${messageTime}`}
      >
        <div className="break-words" aria-label={`Message: ${message.content}`}>
          {message.content}
        </div>
      </div>
    </div>
  );
};

export default ChatRoomMessage;
