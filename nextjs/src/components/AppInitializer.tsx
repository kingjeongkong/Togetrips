'use client';

import { usePushNotifications } from '@/features/notifications/hooks/usePushNotifications';
import { useGlobalSubscription } from '@/hooks/useGlobalSubscription';
import { createBrowserSupabaseClient } from '@/lib/supabase-config';
import { useSession } from '@/providers/SessionProvider';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const AppInitializer = () => {
  const { isAuthenticated, isLoading } = useSession();
  const { syncTokenOnLogin, settings, isLoadingSettings } = usePushNotifications();
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createBrowserSupabaseClient();

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
        const { url } = event.data;

        if (url) {
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

  // 앱 활성화/비활성화 시 WebSocket 연결 직접 제어
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        supabase.realtime.connect();
        queryClient.invalidateQueries();
      } else if (document.visibilityState === 'hidden') {
        supabase.realtime.disconnect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);

  return null;
};
