'use client';

import { FCMTokenService } from '@/features/notifications/services/notificationService';
import { getFCMToken } from '@/lib/firebase-client';
import { useSession } from '@/providers/SessionProvider';
import { useEffect } from 'react';

export const AppInitializer = () => {
  const { userId } = useSession();

  const initializeFCMToken = async () => {
    try {
      if (Notification.permission === 'denied') {
        console.log('알림 권한이 거부됨 - FCM 토큰 등록 스킵');
        return;
      }

      if (Notification.permission === 'default') {
        console.log('알림 권한 요청 중...');
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('알림 권한이 거부됨 - FCM 토큰 등록 스킵');
          return;
        }
      }

      console.log('FCM 토큰 획득 중...');
      const fcmToken = await getFCMToken();

      console.log('기존 FCM 토큰 확인 중...');
      const existingTokens = await FCMTokenService.getTokens();

      const isTokenRegistered = existingTokens.some((token) => token.token === fcmToken);

      if (isTokenRegistered) {
        console.log('FCM 토큰이 이미 등록됨 - 등록 스킵');
        return;
      }

      console.log('FCM 토큰 서버 등록 중...');
      await FCMTokenService.registerToken({
        token: fcmToken,
        device_type: 'web',
      });

      console.log('FCM 토큰 자동 등록 완료');
    } catch (error) {
      console.error('FCM 토큰 자동 등록 실패:', error);
    }
  };

  // 사용자가 로그인하면 FCM 토큰 초기화 실행
  useEffect(() => {
    if (userId) {
      initializeFCMToken();
    }
  }, [userId]);

  // 권한 변경 감지 및 자동 FCM 토큰 등록
  useEffect(() => {
    if (!userId) return;

    const handlePermissionChange = () => {
      console.log('알림 권한 변경 감지:', Notification.permission);

      if (Notification.permission === 'granted') {
        console.log('권한이 허용됨 - FCM 토큰 자동 등록 시작');
        initializeFCMToken();
      }
    };

    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' }).then((permissionStatus) => {
        permissionStatus.addEventListener('change', handlePermissionChange);

        return () => {
          permissionStatus.removeEventListener('change', handlePermissionChange);
        };
      });
    }

    return () => {
      if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'notifications' }).then((permissionStatus) => {
          permissionStatus.removeEventListener('change', handlePermissionChange);
        });
      }
    };
  }, [userId]);

  return null;
};
