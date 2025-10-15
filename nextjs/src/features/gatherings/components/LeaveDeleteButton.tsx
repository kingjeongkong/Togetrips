import { HiRefresh } from 'react-icons/hi';

interface LeaveDeleteButtonProps {
  isHost: boolean;
  isJoined: boolean;
  isLoading?: boolean;
  onLeave?: () => void;
  onDelete?: () => void;
  className?: string;
}

export default function LeaveDeleteButton({
  isHost,
  isJoined,
  isLoading = false,
  onLeave,
  onDelete,
  className = '',
}: LeaveDeleteButtonProps) {
  if (!isJoined) {
    return null;
  }

  const getButtonText = () => {
    if (isHost) return 'Delete Gathering';
    return 'Leave Gathering';
  };

  const handleClick = () => {
    if (isLoading) return;

    if (isHost && onDelete) {
      onDelete();
    } else if (!isHost && onLeave) {
      onLeave();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        px-4 py-2 sm:px-6 sm:py-3 rounded-md text-sm sm:text-base font-medium transition-all duration-200
        ${
          isHost
            ? 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
            : 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
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
