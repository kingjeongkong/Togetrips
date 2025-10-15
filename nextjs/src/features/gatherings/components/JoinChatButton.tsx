import { HiRefresh } from 'react-icons/hi';

interface JoinChatButtonProps {
  isJoined: boolean;
  isFull: boolean;
  isLoading?: boolean;
  onJoin?: () => void;
  onViewChat?: () => void;
  className?: string;
}

export default function JoinChatButton({
  isJoined,
  isFull,
  isLoading = false,
  onJoin,
  onViewChat,
  className = '',
}: JoinChatButtonProps) {
  const getButtonText = () => {
    if (isJoined) return 'View Chat Room';
    if (isFull) return 'Full';
    return 'Join';
  };

  const handleClick = () => {
    if (isLoading) return;

    if (isJoined && onViewChat) {
      onViewChat();
    } else if (!isJoined && !isFull && onJoin) {
      onJoin();
    }
  };

  const isDisabled = isLoading || isFull;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        px-4 py-2 sm:px-6 sm:py-3 rounded-md text-sm sm:text-base font-medium transition-all duration-200
        ${
          isJoined
            ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            : isFull
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <HiRefresh className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      ) : (
        getButtonText()
      )}
    </button>
  );
}
