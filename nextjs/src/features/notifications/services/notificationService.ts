import {
  FCMToken,
  NotificationSettings,
  RegisterTokenRequest,
  UpdateNotificationSettingsRequest,
} from '../types/notification';

// FCM 토큰 관련 API 함수들
export const FCMTokenService = {
  // FCM 토큰 등록
  async registerToken(request: RegisterTokenRequest): Promise<FCMToken> {
    const response = await fetch('/api/notifications/tokens/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to register FCM token');
    }

    return data.data;
  },

  // 사용자의 FCM 토큰 목록 조회
  async getTokens(): Promise<FCMToken[]> {
    const response = await fetch('/api/notifications/tokens/get');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch FCM tokens');
    }

    return data.data || [];
  },

  // FCM 토큰 삭제
  async deleteToken(token: string): Promise<void> {
    const response = await fetch('/api/notifications/tokens/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete FCM token');
    }
  },
};

// 알림 설정 관련 API 함수들
export const NotificationSettingsService = {
  // 알림 설정 조회
  async getSettings(): Promise<NotificationSettings> {
    const response = await fetch('/api/notifications/settings');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch notification settings');
    }

    return data.data;
  },

  // 알림 설정 업데이트
  async updateSettings(updates: UpdateNotificationSettingsRequest): Promise<NotificationSettings> {
    const response = await fetch('/api/notifications/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update notification settings');
    }

    return data.data;
  },
};
