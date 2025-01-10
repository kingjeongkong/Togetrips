import { formatMessageDate } from '../../../../../utils/dateUtils';

interface ChatRoomDateDividerProps {
  date: string;
}

const ChatRoomDateDivider = ({ date }: ChatRoomDateDividerProps) => {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-gray-100 text-gray-700 text-sm px-4 py-1 rounded-full">
        {date}
      </div>
    </div>
  );
};

export default ChatRoomDateDivider;
