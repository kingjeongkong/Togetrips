import { HiRefresh } from 'react-icons/hi';

interface JoinButtonProps {
  isHost: boolean;
  isJoined: boolean;
  isFull: boolean;
  isLoading?: boolean;
  onJoin?: () => void;
  onLeave?: () => void;
  className?: string;
}

export default function JoinButton({
  isHost,
  isJoined,
  isFull,
  isLoading = false,
  onJoin,
  onLeave,
  className = '',
}: JoinButtonProps) {
  const getButtonText = () => {
    if (isHost) return 'Manage';
    if (isJoined) return 'Leave';
    if (isFull) return 'Full';
    return 'Join';
  };

  const handleClick = () => {
    if (isLoading) return;

    if (isJoined && onLeave) {
      onLeave();
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
          isHost
            ? 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
            : isJoined
              ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
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
          <span className="hidden sm:inline">Loading...</span>
          <span className="sm:hidden">...</span>
        </div>
      ) : (
        getButtonText()
      )}
    </button>
  );
}
