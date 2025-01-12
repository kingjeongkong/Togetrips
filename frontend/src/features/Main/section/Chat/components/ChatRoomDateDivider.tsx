interface ChatRoomDateDividerProps {
  date: string;
}

const ChatRoomDateDivider = ({ date }: ChatRoomDateDividerProps) => {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full md:text-sm md:px-4">
        {date}
      </div>
    </div>
  );
};

export default ChatRoomDateDivider;
