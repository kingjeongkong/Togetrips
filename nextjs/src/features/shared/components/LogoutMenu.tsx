import { useEffect, useRef } from 'react';
import { FiLogOut } from 'react-icons/fi';

interface LogoutMenuProps {
  onLogout: () => void;
  className?: string;
  direction?: 'down' | 'up' | 'left' | 'right';
  onClose: () => void;
}

const directionClass = {
  down: 'absolute mt-2',
  up: 'absolute mb-2 bottom-full',
  left: 'absolute mr-2 right-full',
  right: 'absolute ml-2 left-full',
};

const LogoutMenu = ({ onLogout, className = '', direction = 'down', onClose }: LogoutMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className={`z-50 w-36 bg-white rounded-lg shadow-lg py-2 border border-gray-200 ${directionClass[direction]} ${className}`}
    >
      <button
        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
        onClick={onLogout}
      >
        <FiLogOut className="mr-2 w-5 h-5" />
        Logout
      </button>
    </div>
  );
};

export default LogoutMenu;
