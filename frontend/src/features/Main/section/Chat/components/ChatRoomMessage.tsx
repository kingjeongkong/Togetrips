import { formatMessageTime } from "../../../../../utils/dateUtils";

interface ChatRoomMessageProps {
  text: string;
  time: string;
  isMine: boolean;
}

const ChatRoomMessage = ({ text, time, isMine }: ChatRoomMessageProps) => {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isMine ? 'bg-blue-500 text-white' : 'bg-white'
        }`}
      >
        <p className="break-words">{text}</p>
        <p
          className={`text-xs mt-1 text-right ${
            isMine ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {formatMessageTime(time)}
        </p>
      </div>
    </div>
  );
};

export default ChatRoomMessage;
