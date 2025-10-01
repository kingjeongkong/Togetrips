'use client';

import { usePushNotifications } from '@/features/notifications/hooks/usePushNotifications';
import { useGlobalSubscription } from '@/hooks/useGlobalSubscription';
import { useSession } from '@/providers/SessionProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const AppInitializer = () => {
  const { isAuthenticated, isLoading } = useSession();
  const { syncTokenOnLogin, settings, isLoadingSettings } = usePushNotifications();
  const router = useRouter();

  useGlobalSubscription();

  useEffect(() => {
    // 로그인 상태이고, settings 데이터가 로드된 후에만 토큰 동기화 실행
    if (!isLoading && isAuthenticated && !isLoadingSettings && settings) {
      console.log('사용자 로그인 감지, 토큰 동기화 시작...');

      syncTokenOnLogin();
    }
  }, [isAuthenticated, isLoading, isLoadingSettings, settings, syncTokenOnLogin]);

  // 알림 클릭 처리
  useEffect(() => {
    const handleNotificationClick = (event: MessageEvent) => {
      // Service Worker에서 전달된 알림 클릭 이벤트 처리
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        const { url, notificationType, chatRoomId } = event.data;

        if (notificationType === 'chat' && chatRoomId) {
          router.push(`/chat/${chatRoomId}`);
        } else if (notificationType === 'request') {
          router.push('/request');
        } else if (notificationType === 'gathering') {
          router.push('/gathering');
        } else if (url) {
          router.push(url);
        } else {
          router.push('/');
        }
      }
    };

    window.addEventListener('message', handleNotificationClick);

    return () => {
      window.removeEventListener('message', handleNotificationClick);
    };
  }, [router]);

  return null;
};
