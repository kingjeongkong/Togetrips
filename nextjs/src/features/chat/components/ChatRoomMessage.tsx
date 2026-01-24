import Image from 'next/image';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { Message } from '../types/chatTypes';

interface ChatRoomMessageProps {
  message: Message;
  isOwnMessage: boolean;
  sender?: {
    id: string;
    name: string;
    image: string;
  };
  onResend: (message: Message) => void;
}

const ChatRoomMessage = ({ message, isOwnMessage, sender, onResend }: ChatRoomMessageProps) => {
  const messageTime = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}
      aria-label={`${isOwnMessage ? 'My message' : 'Other message'} at ${messageTime}: ${message.content}`}
    >
      {/* 그룹 채팅에서 상대방 메시지일 때만 프로필 이미지 표시 */}
      {!isOwnMessage && sender && (
        <div className="flex-shrink-0">
          <Image
            src={sender.image}
            alt={sender.name}
            className="w-8 h-8 rounded-full"
            width={32}
            height={32}
          />
        </div>
      )}

      {/* 메시지 컨텐츠 영역 */}
      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[80%]`}>
        {/* 그룹 채팅에서 상대방 메시지일 때만 이름 표시 */}
        {!isOwnMessage && sender && (
          <span className="text-xs text-gray-600 font-medium mb-1">{sender.name}</span>
        )}
        {/* 메시지 버블과 시간 */}
        <div className={`flex items-end gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
          <div
            className={`rounded-2xl px-3 py-2 text-sm md:text-base break-words
              ${isOwnMessage ? 'bg-indigo-500 text-white' : 'bg-white text-gray-900'}
              ${message.pending ? 'opacity-60 dark:text-black' : ''}
              ${message.error ? 'bg-red-500 opacity-60' : ''}
            `}
            aria-label={`Message: ${message.content}`}
          >
            <p>{message.content}</p>
          </div>

          <div
            className={`text-xs pb-1 dark:text-black ${isOwnMessage ? 'order-1' : 'order-2'} `}
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
        </div>
      </div>
    </div>
  );
};

export default ChatRoomMessage;
