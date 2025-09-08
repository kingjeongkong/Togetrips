'use client';

import { usePushNotifications } from '@/features/notifications/hooks/usePushNotifications';
import { useSession } from '@/providers/SessionProvider';
import { useEffect } from 'react';

export const AppInitializer = () => {
  const { isAuthenticated, isLoading } = useSession();
  const { syncTokenOnLogin } = usePushNotifications();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('사용자 로그인 감지, 토큰 동기화 시작...');

      syncTokenOnLogin();
    }
  }, [isAuthenticated, isLoading, syncTokenOnLogin]);

  return null;
};
