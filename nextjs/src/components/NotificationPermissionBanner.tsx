'use client';

import { usePushNotifications } from '@/features/notifications/hooks/usePushNotifications';
import { useSession } from '@/providers/SessionProvider';
import { useEffect, useState } from 'react';
import { FiBell, FiX } from 'react-icons/fi';

const NotificationPermissionBanner = () => {
  const { userId } = useSession();
  const { enableNotifications, isEnabling } = usePushNotifications();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Notification API가 지원되는지 확인
    if (typeof Notification === 'undefined') {
      return;
    }

    const isPWA =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator &&
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true);

    if (userId && isPWA && Notification.permission === 'default') {
      setIsVisible(true);
    }
  }, [userId]);

  const handleAccept = async () => {
    try {
      await enableNotifications();
      setIsVisible(false);
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white p-3 shadow-lg">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <FiBell className="w-5 h-5" />
            <p className="font-medium">Enable notifications?</p>
          </div>
          <p className="text-sm opacity-90 mt-1">Don't miss new chats and requests</p>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={handleAccept}
            disabled={isEnabling}
            className="bg-white text-blue-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEnabling ? 'Processing...' : 'Allow'}
          </button>
          <button
            onClick={handleDismiss}
            className="text-white/80 px-2 py-1 text-sm hover:text-white"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionBanner;
