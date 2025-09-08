'use client';

import { usePushNotifications } from '@/features/notifications/hooks/usePushNotifications';
import { useSession } from '@/providers/SessionProvider';
import { useEffect } from 'react';

export const AppInitializer = () => {
  const { isAuthenticated, isLoading } = useSession();
  const { syncTokenOnLogin, settings, isLoadingSettings } = usePushNotifications();

  useEffect(() => {
    // 로그인 상태이고, settings 데이터가 로드된 후에만 토큰 동기화 실행
    if (!isLoading && isAuthenticated && !isLoadingSettings && settings) {
      console.log('사용자 로그인 감지, 토큰 동기화 시작...');

      syncTokenOnLogin();
    }
  }, [isAuthenticated, isLoading, isLoadingSettings, settings, syncTokenOnLogin]);

  return null;
};
