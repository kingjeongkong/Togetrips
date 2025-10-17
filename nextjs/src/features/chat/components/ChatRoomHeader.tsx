import LoadingIndicator from '@/components/LoadingIndicator';
import { useDeleteChatRoom } from '@/features/chat/hooks/useDeleteChatRoom';
import { useDeleteGathering, useLeaveGathering } from '@/features/shared/hooks/useSharedGathering';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FiArrowLeft, FiMoreVertical } from 'react-icons/fi';
interface ChatRoomHeaderProps {
  image: string;
  title: string;
  isHost?: boolean;
  gatheringId?: string;
  participantCount?: number;
  chatRoomId: string;
  isGroupChat?: boolean;
  onBeforeDelete?: () => void;
}

const ChatRoomHeader = ({
  image,
  title,
  isHost = false,
  gatheringId = '',
  participantCount,
  chatRoomId,
  isGroupChat = false,
  onBeforeDelete,
}: ChatRoomHeaderProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { leaveGathering, isLeaving } = useLeaveGathering(gatheringId || '');
  const { deleteGathering, isDeleting } = useDeleteGathering(gatheringId || '');
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
      ? isHost
        ? 'Are you sure you want to delete this group?'
        : 'Are you sure you want to leave this group?'
      : 'Are you sure you want to leave this chat room?';

    if (window.confirm(confirmMessage)) {
      onBeforeDelete?.();

      if (isGroupChat && gatheringId) {
        if (isHost) {
          deleteGathering();
        } else {
          await leaveGathering();
          router.back();
        }
      } else {
        deleteChatRoom.mutate(chatRoomId);
        console.log('Direct chat room 삭제 완료');
      }
    }
    setShowMenu(false);
  };

  const handleBackClick = () => {
    if (window.history.length <= 2) {
      router.push('/chat');
    } else {
      router.back();
    }
  };

  const isLoading = isDeleting || isLeaving || deleteChatRoom.isPending;

  return (
    <div className="flex-shrink-0 bg-gray-100 border-b border-gray-200 px-4 py-3">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <LoadingIndicator />
            <p className="mt-2 text-sm text-gray-600">
              {isGroupChat
                ? isHost
                  ? 'Deleting group...'
                  : 'Leaving group...'
                : 'Leaving chat room...'}
            </p>
          </div>
        </div>
      )}

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
                onClick={handleDeleteChatRoom}
                disabled={isLoading}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors rounded-lg text-sm"
              >
                {isGroupChat ? (isHost ? 'Delete group' : 'Leave group') : 'Leave chat room'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoomHeader;
