import { HiPencil } from 'react-icons/hi';

interface EditButtonProps {
  isHost: boolean;
  isLoading?: boolean;
  onEdit?: () => void;
  className?: string;
}

export default function EditButton({
  isHost,
  isLoading = false,
  onEdit,
  className = '',
}: EditButtonProps) {
  if (!isHost) {
    return null;
  }

  return (
    <button
      onClick={onEdit}
      disabled={isLoading}
      className={`
        p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      title="Edit gathering"
      aria-label="Edit gathering"
    >
      <HiPencil className="w-8 h-8 rounded-full bg-gray-100 p-1" />
    </button>
  );
}
