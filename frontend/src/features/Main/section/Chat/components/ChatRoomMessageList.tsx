import { useEffect, useRef, useState } from 'react';
import { formatMessageDate } from '../../../../../utils/dateUtils';
import { Message } from '../types/chatTypes';
import ChatRoomDateDivider from './ChatRoomDateDivider';
import ChatRoomMessage from './ChatRoomMessage';
import { BsArrowDownCircleFill } from 'react-icons/bs';

interface ChatRoomMessageListProps {
  messages: Message[];
  currentUserID: string;
}

const ChatRoomMessageList = ({ messages, currentUserID }: ChatRoomMessageListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesByDate = messages.reduce(
    (groups: { [key: string]: Message[] }, message) => {
      const date = formatMessageDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    },
    {}
  );

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 300;
      setShowScrollButton(!isNearBottom);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);

      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-y-auto px-2 py-2 bg-gray-200"
      style={{ height: '100%', maxHeight: '100%' }}
    >
      {Object.entries(messagesByDate).map(([date, messages]) => (
        <div key={date} className="space-y-1">
          <ChatRoomDateDivider date={date} />
          {messages.map((message) => (
            <ChatRoomMessage
              key={message.id}
              text={message.content}
              time={message.timestamp}
              isMine={message.senderID === currentUserID}
            />
          ))}
        </div>
      ))}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed right-4 bottom-36 md:bottom-20 transition-all text-white"
        >
          <BsArrowDownCircleFill className="w-8 h-8 md:w-10 md:h-10" />
        </button>
      )}
    </div>
  );
};

export default ChatRoomMessageList;
