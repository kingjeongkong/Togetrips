import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { Message } from '../types/chatTypes';

interface ChatRoomMessageProps {
  message: Message;
  isOwnMessage: boolean;
  onResend: (message: Message) => void;
}

const ChatRoomMessage = ({ message, isOwnMessage, onResend }: ChatRoomMessageProps) => {
  const messageTime = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      className={`flex gap-1 ${isOwnMessage ? 'justify-end' : 'justify-start'} items-end mb-2`}
      aria-label={`${isOwnMessage ? 'My message' : 'Other message'} at ${messageTime}: ${message.content}`}
    >
      <div
        className={`text-xs pb-1 flex items-end ${isOwnMessage ? 'order-1' : 'order-2'}`}
        aria-label={`Message sent at ${messageTime}`}
      >
        {message.pending ? (
          <AiOutlineLoading3Quarters className="ml-2 animate-spin" />
        ) : message.error ? (
          <span
            className="ml-2 text-red-500 cursor-pointer"
            onClick={() => onResend(message)}
            title="resend"
          >
            ❗Resend
          </span>
        ) : (
          messageTime
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm md:text-base break-words flex-shrink-0
          ${isOwnMessage ? 'bg-indigo-500 text-white order-2' : 'bg-white text-gray-900 order-1'}
          ${message.pending ? 'opacity-60' : ''}
          ${message.error ? 'bg-red-600 opacity-60' : ''}
        `}
        aria-label={`Message: ${message.content}`}
      >
        <p>{message.content}</p>
      </div>
    </div>
  );
};

export default ChatRoomMessage;
