'use client';

import { useUnreadCount } from '@/features/chat/hooks/useUnreadCount';
import { useRequestCount } from '@/features/request/hooks/useRequestCount';
import SidebarItem from '@/features/shared/components/SidebarItem';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { IconType } from 'react-icons';
import { FaBell, FaHome, FaUserAlt } from 'react-icons/fa';
import { FiSettings } from 'react-icons/fi';
import { MdChat } from 'react-icons/md';
import LogoutMenu from './LogoutMenu';

interface MenuItem {
  title: string;
  icon: IconType;
  to: string;
  count?: number;
}

const Sidebar = () => {
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isChatRoute = pathname.startsWith('/chat');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { handleSignOut } = useAuthActions();

  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: requestCount = 0 } = useRequestCount();

  const menuItems: MenuItem[] = [
    { title: 'Home', icon: FaHome, to: '/home' },
    { title: 'Chat', icon: MdChat, to: '/chat', count: unreadCount > 0 ? unreadCount : undefined },
    {
      title: 'Requests',
      icon: FaBell,
      to: '/request',
      count: requestCount > 0 ? requestCount : undefined,
    },
    { title: 'Profile', icon: FaUserAlt, to: '/profile' },
  ];

  return (
    <>
      <div
        className={`flex fixed items-center top-0 left-0 shadow-sm z-20 
        w-full justify-start pl-4 bg-gray-100
        md:w-60 md:justify-center md:pl-0 md:bg-transparent
        ${isMobile && isChatRoute ? 'hidden' : ''}
        `}
      >
        <div className="flex items-center justify-center py-3 md:py-5">
          <Image
            src="/togetrips-logo.png"
            alt="Togetrips"
            width={40}
            height={40}
            className="w-8 h-8 md:w-10 md:h-10"
          />
          <p className="font-bold text-xl md:text-2xl text-black">Togetrips</p>
        </div>
      </div>

      <div
        className="fixed flex items-center shadow-md z-10 
        flex-row justify-around w-full h-16 bottom-0 left-0 bg-white
        md:flex-col md:justify-start md:top-0 md:w-60 md:bg-sky-200 md:h-full md:pt-24 md:space-y-1
        "
      >
        {menuItems.map((item, index) => (
          <SidebarItem
            key={index}
            title={item.title}
            icon={item.icon}
            to={item.to}
            count={item.count}
          />
        ))}
        <div className="hidden md:flex flex-col items-center w-full mt-auto mb-6 relative">
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-sky-300 transition"
            onClick={() => setSettingsOpen((prev) => !prev)}
            aria-label="Settings"
          >
            <FiSettings className="w-6 h-6 text-gray-700" />
          </button>
          {settingsOpen && (
            <LogoutMenu
              onLogout={handleSignOut}
              onClose={() => setSettingsOpen(false)}
              direction="up"
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
