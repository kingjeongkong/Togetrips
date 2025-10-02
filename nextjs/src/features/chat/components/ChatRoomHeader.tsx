import { useDeleteChatRoom } from '@/features/chat/hooks/useDeleteChatRoom';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FiArrowLeft, FiMoreVertical } from 'react-icons/fi';

interface ChatRoomHeaderProps {
  image: string;
  title: string;
  participantCount?: number;
  chatRoomId: string;
  isGroupChat?: boolean;
}

const ChatRoomHeader = ({
  image,
  title,
  participantCount,
  chatRoomId,
  isGroupChat = false,
}: ChatRoomHeaderProps) => {
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
    const confirmMessage = isGroupChat
      ? 'Are you sure you want to leave this group?\nYou will no longer receive messages from this group.'
      : 'Are you sure you want to leave this chat room?\nMessages in the chat room cannot be recovered.';

    if (window.confirm(confirmMessage)) {
      await deleteChatRoom.mutateAsync(chatRoomId);
    }
    setShowMenu(false);
  };

  const handleLeaveGroup = async () => {
    // TODO: 그룹 탈퇴 로직 구현
  };

  const handleBackClick = () => {
    // 히스토리 스택의 길이를 확인하여 딥링크 진입인지 판단
    if (window.history.length <= 2) {
      // 히스토리 스택이 거의 비어있으면(PWA 초기 진입 등),
      // 채팅 목록 페이지로 직접 이동시켜 인위적으로 스택을 만들어 줌
      router.push('/chat');
    } else {
      // 히스토리 스택에 이전 페이지가 있으면 정상적으로 뒤로가기
      router.back();
    }
  };

  return (
    <div className="flex-shrink-0 bg-gray-100 border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={handleBackClick}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors mr-1 md:hidden"
            aria-label="Go back"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <Image
            src={image}
            alt={title}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full mr-3"
          />
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {participantCount && (
            <span className="text-xs text-gray-500 flex-shrink-0">({participantCount})</span>
          )}
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
                onClick={isGroupChat ? handleLeaveGroup : handleDeleteChatRoom}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors rounded-lg text-sm"
              >
                {isGroupChat ? 'Leave group' : 'Leave chat room'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoomHeader;
