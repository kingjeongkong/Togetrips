interface ChatRoomHeaderProps {
    profileImage: string
    name: string
}

const ChatRoomHeader = ({ profileImage, name }: ChatRoomHeaderProps) => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-300 md:py-2">
        <img className="w-8 h-8 rounded-full md:w-12 md:h-12" src={profileImage} />
        <p className="text-base font-semibold md:text-xl md:font-bold">{name}</p>
    </div>
  )
};

export default ChatRoomHeader;
