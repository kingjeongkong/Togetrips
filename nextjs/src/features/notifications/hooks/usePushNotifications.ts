import { getFCMToken } from '@/lib/firebase-client';
import { useSession } from '@/providers/SessionProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FCMTokenService, NotificationSettingsService } from '../services/notificationService';

export const usePushNotifications = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSession();

  const [permission, setPermission] = useState<NotificationPermission>('default');

  // 권한 상태 동기화
  useEffect(() => {
    // Notification API가 지원되는지 확인
    if (typeof Notification === 'undefined') {
      setPermission('denied');
      return;
    }

    setPermission(Notification.permission);

    // 권한 변경 감지
    const handlePermissionChange = () => {
      if (typeof Notification !== 'undefined') {
        setPermission(Notification.permission);
      }
    };

    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' }).then((permissionStatus) => {
        permissionStatus.addEventListener('change', handlePermissionChange);
        return () => permissionStatus.removeEventListener('change', handlePermissionChange);
      });
    }
  }, []);

  // 알림 설정 조회
  const {
    data: settings,
    isLoading: isLoadingSettings,
    error: settingsError,
  } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: NotificationSettingsService.getSettings,
    staleTime: 60 * 60 * 1000,
    enabled: isAuthenticated,
  });

  // FCM 토큰 목록 조회
  const {
    data: tokens = [],
    isLoading: isLoadingTokens,
    error: tokensError,
  } = useQuery({
    queryKey: ['fcmTokens'],
    queryFn: FCMTokenService.getTokens,
    staleTime: 24 * 60 * 60 * 1000,
    enabled: isAuthenticated,
  });

  // 현재 기기의 FCM 토큰 등록 여부 확인
  const checkCurrentDeviceToken = async (): Promise<boolean> => {
    try {
      const currentToken = await getFCMToken();
      return tokens.some((token) => token.token === currentToken);
    } catch {
      return false;
    }
  };

  // 알림 활성화 뮤테이션: 최적화된 권한 요청 및 토큰 등록
  const { mutate: enableNotifications, isPending: isEnabling } = useMutation({
    mutationFn: async () => {
      // Notification API가 지원되지 않는 경우 에러 처리
      if (typeof Notification === 'undefined') {
        throw new Error('Notifications are not supported in this browser');
      }

      // 1단계: 권한이 없으면 요청 (이미 있으면 스킵)
      if (Notification.permission !== 'granted') {
        const permissionResult = await Notification.requestPermission();
        if (permissionResult !== 'granted') {
          throw new Error('Notification permission denied');
        }
      }

      // 2단계: FCM 토큰 획득
      const fcmToken = await getFCMToken();

      // 3단계: 토큰이 이미 등록되어 있는지 확인 후 조건부 등록
      const isTokenRegistered = await checkCurrentDeviceToken();

      if (!isTokenRegistered) {
        await FCMTokenService.registerToken({
          token: fcmToken,
          device_type: 'web',
        });
      }

      // 4단계: 알림 설정 활성화
      return await NotificationSettingsService.updateSettings({
        push_enabled: true,
        chat_notifications: true,
        request_notifications: true,
      });
    },
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(['notificationSettings'], updatedSettings);
      queryClient.invalidateQueries({ queryKey: ['fcmTokens'] });
      setPermission('granted');
    },
    onError: (error) => {
      console.error('Failed to enable notifications:', error);
      toast.error('Failed to enable push notifications');
    },
  });

  // 알림 비활성화 뮤테이션
  const { mutate: disableNotifications, isPending: isDisabling } = useMutation({
    mutationFn: async () => {
      return await NotificationSettingsService.updateSettings({
        push_enabled: false,
      });
    },
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(['notificationSettings'], updatedSettings);
    },
    onError: (error) => {
      console.error('Failed to disable notifications:', error);
      toast.error('Failed to disable push notifications');
    },
  });

  // 개별 알림 타입 설정 업데이트
  const { mutate: updateNotificationType, isPending: isUpdatingType } = useMutation({
    mutationFn: NotificationSettingsService.updateSettings,
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(['notificationSettings'], updatedSettings);
    },
    onError: (error) => {
      console.error('Failed to update notification type:', error);
      toast.error('Failed to update notification settings');
    },
  });

  // 현재 기기에서 알림이 활성화되어 있는지 확인
  const isEnabledOnThisDevice = settings?.push_enabled && permission === 'granted';

  // 현재 기기의 FCM 토큰 삭제
  const deleteCurrentDeviceToken = async (): Promise<void> => {
    try {
      const currentToken = await getFCMToken();

      if (!currentToken) {
        console.warn('FCM 토큰을 가져올 수 없음');
        return;
      }

      await FCMTokenService.deleteToken(currentToken);
    } catch (error) {
      console.error('FCM 토큰 삭제 중 오류 발생:', error);
      throw error;
    }
  };

  // 로그인 시 FCM 토큰 동기화
  const { mutate: syncTokenOnLogin, isPending: isSyncing } = useMutation({
    mutationFn: async () => {
      if (Notification.permission !== 'granted') {
        console.log('알림 권한이 허용되지 않음, 토큰 동기화 스킵');
        return;
      }

      if (!settings) {
        console.log('알림 설정 로딩 중, 토큰 동기화 스킵');
        return;
      }

      if (!settings.push_enabled) {
        console.log('알림이 비활성화됨, 토큰 동기화 스킵');
        return;
      }

      const isTokenAlreadyRegistered = await checkCurrentDeviceToken();

      if (!isTokenAlreadyRegistered) {
        console.log('현재 기기 토큰이 서버에 없음, 재등록 중...');
        const fcmToken = await getFCMToken();
        await FCMTokenService.registerToken({
          token: fcmToken,
          device_type: 'web',
        });
        console.log('토큰 재등록 완료');
      } else {
        console.log('현재 기기 토큰이 이미 서버에 등록되어 있음');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fcmTokens'] });
    },
    onError: (error) => {
      console.warn('토큰 동기화 실패 (앱 사용에는 영향 없음):', error);
    },
  });

  // 로딩 상태 통합
  const isLoading = isLoadingSettings || isLoadingTokens;

  // 에러 상태 통합
  const error = settingsError || tokensError;

  return {
    // 상태
    settings,
    tokens,
    permission,
    isLoading,
    isLoadingSettings,
    error,

    // 계산된 값
    isEnabledOnThisDevice,

    // 로딩 상태
    isEnabling,
    isDisabling,
    isUpdatingType,
    isSyncing,

    // 액션
    enableNotifications,
    disableNotifications,
    updateNotificationType,
    syncTokenOnLogin,

    // 유틸리티
    checkCurrentDeviceToken,
    deleteCurrentDeviceToken,
  };
};
