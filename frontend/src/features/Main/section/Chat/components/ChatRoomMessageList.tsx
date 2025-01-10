import { formatMessageDate } from '../../../../../utils/dateUtils';
import { Message } from '../types/chatTypes';
import ChatRoomDateDivider from './ChatRoomDateDivider';
import ChatRoomMessage from './ChatRoomMessage';

interface ChatRoomMessageListProps {
  messages: Message[];
  currentUserID: string;
}

const ChatRoomMessageList = ({ messages, currentUserID }: ChatRoomMessageListProps) => {
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

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 bg-gray-200">
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
