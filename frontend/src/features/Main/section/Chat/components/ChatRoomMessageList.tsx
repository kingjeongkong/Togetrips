import { useEffect, useRef } from 'react';
import { formatMessageDate } from '../../../../../utils/dateUtils';
import { Message } from '../types/chatTypes';
import ChatRoomDateDivider from './ChatRoomDateDivider';
import ChatRoomMessage from './ChatRoomMessage';

interface ChatRoomMessageListProps {
  messages: Message[];
  currentUserID: string;
}

const ChatRoomMessageList = ({ messages, currentUserID }: ChatRoomMessageListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    // Scroll to the bottom
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-2 py-2 bg-gray-200"
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
    </div>
  );
};

export default ChatRoomMessageList;
