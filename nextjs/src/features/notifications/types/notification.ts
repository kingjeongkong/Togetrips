// FCM 토큰 정보
export interface FCMToken {
  id: string;
  user_id: string;
  token: string;
  device_type: 'web' | 'android' | 'ios';
  created_at: string;
  updated_at: string;
}

// 알림 설정
export interface NotificationSettings {
  user_id: string;
  chat_notifications: boolean;
  request_notifications: boolean;
  push_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// 푸시 알림 데이터
export interface PushNotificationData {
  type: 'chat' | 'request' | 'system';
  id?: string;
  chatRoomId?: string;
  requestId?: string;
  senderId?: string;
  [key: string]: string | undefined;
}

// 푸시 알림 메시지
export interface PushNotificationMessage {
  title: string;
  body: string;
  imageUrl?: string;
  data?: PushNotificationData;
}

// 알림 권한 상태
export type NotificationPermission = 'default' | 'granted' | 'denied';

// FCM 토큰 등록 요청
export interface RegisterTokenRequest {
  token: string;
  device_type?: 'web' | 'android' | 'ios';
}

// 알림 설정 업데이트 요청
export interface UpdateNotificationSettingsRequest {
  chat_notifications?: boolean;
  request_notifications?: boolean;
  push_enabled?: boolean;
}

// 알림 히스토리 항목
export interface NotificationHistoryItem {
  id: string;
  user_id: string;
  type: 'chat' | 'request' | 'system';
  title: string;
  body: string;
  data?: PushNotificationData;
  read: boolean;
  created_at: string;
}
