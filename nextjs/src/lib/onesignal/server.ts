import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '../supabase-config';
import { NotificationData, OneSignalNotificationPayload } from './types';

class OneSignalServerService {
  private readonly appId: string;
  private readonly apiKey: string;
  private readonly baseUrl = 'https://onesignal.com/api/v1';

  constructor() {
    this.appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '';
    this.apiKey = process.env.ONESIGNAL_REST_API_KEY || '';

    if (!this.appId || !this.apiKey) {
      console.warn('OneSignal 설정이 완료되지 않았습니다. 환경 변수를 확인해주세요.');
    }
  }

  async sendToUser(userId: string, notification: NotificationData): Promise<boolean> {
    try {
      if (!this.appId || !this.apiKey) {
        throw new Error('OneSignal 설정이 완료되지 않았습니다.');
      }

      const payload: OneSignalNotificationPayload = {
        app_id: this.appId,
        include_external_user_ids: [userId],
        headings: { en: notification.title },
        contents: { en: notification.message },
        data: notification.data,
        url: notification.url,
      };

      const response = await fetch(`${this.baseUrl}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `OneSignal API 오류: ${errorData.errors?.join(', ') || response.statusText}`,
        );
      }

      return true;
    } catch (error) {
      console.error('알림 전송 실패:', error);
      return false;
    }
  }

  async sendToMultipleUsers(userIds: string[], notification: NotificationData): Promise<boolean> {
    try {
      if (!this.appId || !this.apiKey) {
        throw new Error('OneSignal 설정이 완료되지 않았습니다.');
      }

      if (userIds.length === 0) {
        console.log('알림 수신자가 없습니다.');
        return true;
      }

      const payload: OneSignalNotificationPayload = {
        app_id: this.appId,
        include_external_user_ids: userIds,
        headings: { en: notification.title },
        contents: { en: notification.message },
        data: notification.data,
        url: notification.url,
      };

      const response = await fetch(`${this.baseUrl}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `OneSignal API 오류: ${errorData.errors?.join(', ') || response.statusText}`,
        );
      }

      return true;
    } catch (error) {
      console.error('다중 사용자 알림 전송 실패:', error);
      return false;
    }
  }

  isConfigured(): boolean {
    return !!(this.appId && this.apiKey);
  }

  async getOneSignalId(userId: string, request: NextRequest): Promise<string | null> {
    try {
      const supabase = createServerSupabaseClient(request);

      // 사용자의 알림 구독 상태 확인
      const { data, error } = await supabase
        .from('push_notification_subscriptions')
        .select('is_enabled')
        .eq('user_id', userId)
        .eq('provider', 'onesignal')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('알림 구독 상태 확인 실패:', error);
        return null;
      }

      return data.is_enabled ? userId : null;
    } catch (error) {
      console.error('알림 구독 상태 확인 중 오류:', error);
      return null;
    }
  }

  async getOneSignalIds(userIds: string[], request: NextRequest): Promise<string[]> {
    try {
      if (userIds.length === 0) {
        return [];
      }

      const supabase = createServerSupabaseClient(request);

      // 여러 사용자의 알림 구독 상태 확인
      const { data, error } = await supabase
        .from('push_notification_subscriptions')
        .select('user_id')
        .in('user_id', userIds)
        .eq('provider', 'onesignal')
        .eq('is_enabled', true);

      if (error) {
        console.error('알림 구독 상태 목록 조회 실패:', error);
        return [];
      }

      return data?.map((item) => item.user_id) || [];
    } catch (error) {
      console.error('알림 구독 상태 목록 조회 중 오류:', error);
      return [];
    }
  }

  async isUserMapped(userId: string, request: NextRequest): Promise<boolean> {
    try {
      const supabase = createServerSupabaseClient(request);

      const { data, error } = await supabase
        .from('push_notification_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('provider', 'onesignal')
        .eq('is_enabled', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return false;
        }
        console.error('사용자 매핑 상태 확인 실패:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('사용자 매핑 상태 확인 중 오류:', error);
      return false;
    }
  }
}

export const oneSignalServer = new OneSignalServerService();
export default oneSignalServer;
