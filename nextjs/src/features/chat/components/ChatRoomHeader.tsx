import Image from 'next/image';

interface ChatRoomHeaderProps {
  profileImage: string;
  name: string;
}

const ChatRoomHeader = ({ profileImage, name }: ChatRoomHeaderProps) => {
  return (
    <div className="sticky top-0 z-50 bg-gray-100 border-b border-gray-200 px-4 py-3">
      <div className="flex items-center">
        <Image
          src={profileImage}
          alt={name}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full mr-3"
        />
        <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
      </div>
    </div>
  );
};

export default ChatRoomHeader;
