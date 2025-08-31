import { useDeleteChatRoom } from '@/features/chat/hooks/useDeleteChatRoom';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FiArrowLeft, FiMoreVertical } from 'react-icons/fi';

interface ChatRoomHeaderProps {
  profileImage: string;
  name: string;
  chatRoomId: string;
}

const ChatRoomHeader = ({ profileImage, name, chatRoomId }: ChatRoomHeaderProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const deleteChatRoom = useDeleteChatRoom();
  const router = useRouter();

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDeleteChatRoom = async () => {
    if (
      window.confirm(
        'Are you sure you want to leave this chat room?\nMessages in the chat room cannot be recovered.',
      )
    ) {
      await deleteChatRoom.mutateAsync(chatRoomId);
    }
    setShowMenu(false);
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="sticky top-0 z-50 bg-gray-100 border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={handleBackClick}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors mr-1"
            aria-label="Go back"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <Image
            src={profileImage}
            alt={name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full mr-3"
          />
          <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
        </div>

        {/* 메뉴 버튼 */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Chat room menu"
          >
            <FiMoreVertical className="w-5 h-5 text-gray-600" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg border border-gray-200 min-w-[160px] z-50">
              <button
                onClick={handleDeleteChatRoom}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors rounded-lg text-sm"
              >
                Leave chat room
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoomHeader;
