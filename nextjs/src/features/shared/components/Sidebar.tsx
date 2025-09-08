'use client';

import { useUnreadCount } from '@/features/chat/hooks/useUnreadCount';
import { usePushNotifications } from '@/features/notifications/hooks/usePushNotifications';
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
import SettingsMenu from './SettingsMenu';

interface MenuItem {
  title: string;
  icon: IconType;
  to: string;
  count?: number;
}

const Sidebar = () => {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { handleSignOut } = useAuthActions();
  const { deleteCurrentDeviceToken } = usePushNotifications();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isChatRoute = pathname.startsWith('/chat');

  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: requestCount = 0 } = useRequestCount();

  // 로그아웃 시 FCM 토큰 삭제와 인증 세션 종료를 순서대로 처리
  const handleLogout = async () => {
    try {
      console.log('🚪 [DEBUG] 로그아웃 프로세스 시작...');

      // 1단계: FCM 토큰 삭제 (현재 기기에서 더 이상 알림을 받지 않도록)
      try {
        console.log('🔍 [DEBUG] 1단계: FCM 토큰 삭제 시작...');
        await deleteCurrentDeviceToken();
        console.log('✅ [DEBUG] 1단계: FCM 토큰 삭제 완료');
      } catch (error) {
        // FCM 토큰 삭제 실패해도 로그아웃은 계속 진행
        console.error('❌ [DEBUG] 1단계: FCM 토큰 삭제 실패:', error);
      }

      // 2단계: 인증 세션 종료 및 리다이렉트
      console.log('🔍 [DEBUG] 2단계: 인증 세션 종료 시작...');
      await handleSignOut();
      console.log('✅ [DEBUG] 2단계: 인증 세션 종료 완료');
    } catch (error) {
      console.error('❌ [DEBUG] 로그아웃 처리 중 오류 발생:', error);
    }
  };

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

  // 모바일 채팅 화면에서는 하단 바를 숨깁니다.
  if (isMobile && isChatRoute) {
    return null;
  }

  return (
    <>
      {/* --- Desktop Sidebar --- */}
      {/* hidden: 모바일에서는 숨김, md:flex: 데스크탑에서는 flex로 표시 */}
      <div className="hidden md:flex flex-col fixed top-0 left-0 w-60 h-full bg-sky-200 px-2 py-4 z-30">
        <div className="flex items-center justify-center mb-7">
          <Image
            src="/togetrips-logo.png"
            alt="Togetrips"
            width={40}
            height={40}
            className="w-10 h-10 mr-2"
          />
          <p className="font-bold text-2xl text-black">Togetrips</p>
        </div>

        <div className="flex flex-col space-y-1">
          {menuItems.map((item) => (
            <SidebarItem key={item.title} {...item} />
          ))}
        </div>

        <div className="mt-auto flex flex-col items-center w-full mb-4 relative">
          <button
            className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-sky-300 transition"
            onClick={() => setSettingsOpen((prev) => !prev)}
            aria-label="Settings"
          >
            <FiSettings className="w-6 h-6 text-gray-700" />
          </button>
          {settingsOpen && (
            <SettingsMenu
              onLogout={handleLogout}
              onClose={() => setSettingsOpen(false)}
              direction="up"
            />
          )}
        </div>
      </div>
      {/* --- Mobile Bottom Tab Bar --- */}
      {/* md:hidden: 데스크탑에서는 숨김 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] flex justify-around items-center z-30">
        {menuItems.map((item) => (
          <SidebarItem key={item.title} {...item} />
        ))}
      </div>
    </>
  );
};

export default Sidebar;
