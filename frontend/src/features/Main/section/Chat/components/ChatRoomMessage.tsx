import { formatMessageTime } from '../../../../../utils/dateUtils';

interface ChatRoomMessageProps {
  text: string;
  time: string;
  isMine: boolean;
}

const ChatRoomMessage = ({ text, time, isMine }: ChatRoomMessageProps) => {
  return (
    <div className={`flex gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`text-xs flex items-end pb-1 ${isMine ? 'order-1' : 'order-2'}`}>
        {formatMessageTime(time)}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isMine ? 'bg-blue-500 text-white order-2' : 'bg-white order-1'
        }`}
      >
        <p className="break-words">{text}</p>
      </div>
    </div>
  );
};

export default ChatRoomMessage;
