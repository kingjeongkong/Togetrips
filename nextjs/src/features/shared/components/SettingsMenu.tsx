import { useEffect, useRef, useState } from 'react';
import { FiHelpCircle, FiLogOut } from 'react-icons/fi';
import SupportModal from './SupportModal';

interface SettingsMenuProps {
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

const SettingsMenu = ({
  onLogout,
  className = '',
  direction = 'down',
  onClose,
}: SettingsMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isSupportModalOpen) return;

      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, isSupportModalOpen]);

  return (
    <>
      <div
        ref={menuRef}
        className={`z-50 w-40 bg-white rounded-lg shadow-lg py-2 border border-gray-200 ${directionClass[direction]} ${className}`}
      >
        <button
          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
          onClick={() => setIsSupportModalOpen(true)}
        >
          <FiHelpCircle className="mr-2 w-5 h-5" />
          Support
        </button>
        <div className="border-t border-gray-200 my-1"></div>
        <button
          className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
          onClick={onLogout}
        >
          <FiLogOut className="mr-2 w-5 h-5" />
          Logout
        </button>
      </div>

      <SupportModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} />
    </>
  );
};

export default SettingsMenu;
