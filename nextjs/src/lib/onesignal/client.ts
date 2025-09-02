import { createBrowserSupabaseClient } from '@/lib/supabase-config';
import { NotificationData } from './types';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    OneSignal?: any;
  }
}

class OneSignalClientService {
  private readonly appId: string;

  constructor() {
    this.appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '';

    if (!this.appId) {
      console.warn('OneSignal App ID가 설정되지 않았습니다.');
    }
  }

  async initialize(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') {
        console.warn('OneSignal은 클라이언트 환경에서만 초기화할 수 있습니다.');
        return false;
      }

      if (!window.OneSignal) {
        console.warn('OneSignal SDK가 로드되지 않았습니다.');
        return false;
      }

      await window.OneSignal.init({
        appId: this.appId,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: { enable: false },
        autoRegister: true,
        autoResubscribe: true,
      });

      return true;
    } catch (error) {
      console.error('OneSignal 초기화 실패:', error);
      return false;
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !window.OneSignal) {
        console.warn('OneSignal이 초기화되지 않았습니다.');
        return false;
      }

      const result = await window.OneSignal.Notifications.requestPermission();

      if (result === 'granted') {
        const currentUser = await this.getCurrentUserId();
        if (currentUser) {
          await this.updateSubscriptionStatus(currentUser, true);
        }
      }

      return result === 'granted';
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
      return false;
    }
  }

  private async getCurrentUserId(): Promise<string | null> {
    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error('현재 사용자 ID 가져오기 실패:', error);
      return null;
    }
  }

  async getPermissionStatus(): Promise<'default' | 'granted' | 'denied'> {
    try {
      if (typeof window === 'undefined' || !window.OneSignal) {
        return 'default';
      }

      return await window.OneSignal.Notifications.permission;
    } catch (error) {
      console.error('권한 상태 확인 실패:', error);
      return 'default';
    }
  }

  async setUserId(userId: string): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !window.OneSignal) {
        console.warn('OneSignal이 초기화되지 않았습니다.');
        return false;
      }

      // OneSignal에 External User ID로 사용자 등록
      await window.OneSignal.login(userId);

      // 구독 정보를 DB에 저장 (is_enabled = true)
      await this.updateSubscriptionStatus(userId, true);

      console.log('OneSignal 사용자 등록 및 구독 정보 저장 완료:', userId);
      return true;
    } catch (error) {
      console.error('사용자 ID 설정 실패:', error);
      return false;
    }
  }

  private async updateSubscriptionStatus(userId: string, isEnabled: boolean): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          provider: 'onesignal',
          isEnabled,
        }),
      });

      if (!response.ok) {
        console.error('구독 상태 업데이트 실패:', response.statusText);
      }

      return true;
    } catch (error) {
      console.error('구독 상태 DB 업데이트 실패:', error);
      return false;
    }
  }

  async isSubscribed(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !window.OneSignal) {
        return false;
      }

      return await window.OneSignal.User.PushSubscription.optedIn;
    } catch (error) {
      console.error('구독 상태 확인 실패:', error);
      return false;
    }
  }

  async unsubscribe(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !window.OneSignal) {
        console.warn('OneSignal이 초기화되지 않았습니다.');
        return false;
      }

      await window.OneSignal.User.PushSubscription.optOut();

      const currentUser = await this.getCurrentUserId();
      if (currentUser) {
        await this.updateSubscriptionStatus(currentUser, false);
      }
      return true;
    } catch (error) {
      console.error('구독 해제 실패:', error);
      return false;
    }
  }

  async subscribe(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !window.OneSignal) {
        console.warn('OneSignal이 초기화되지 않았습니다.');
        return false;
      }

      await window.OneSignal.User.PushSubscription.optIn();

      const currentUser = await this.getCurrentUserId();
      if (currentUser) {
        await this.updateSubscriptionStatus(currentUser, true);
      }
      return true;
    } catch (error) {
      console.error('구독 활성화 실패:', error);
      return false;
    }
  }

  async showLocalNotification(notification: NotificationData): Promise<boolean> {
    try {
      if (typeof window === 'undefined') {
        return false;
      }

      if (!('Notification' in window)) {
        console.warn('이 브라우저는 알림을 지원하지 않습니다.');
        return false;
      }

      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          data: notification.data,
          icon: '/icon-192x192.png',
        });
        return true;
      } else {
        console.warn('알림 권한이 허용되지 않았습니다.');
        return false;
      }
    } catch (error) {
      console.error('로컬 알림 표시 실패:', error);
      return false;
    }
  }

  isConfigured(): boolean {
    return !!this.appId;
  }

  isOneSignalReady(): boolean {
    return typeof window !== 'undefined' && !!window.OneSignal;
  }
}

export const oneSignalClient = new OneSignalClientService();
export default oneSignalClient;
