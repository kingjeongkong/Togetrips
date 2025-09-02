export interface NotificationData {
  title: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
  url?: string;
}

export interface OneSignalNotificationPayload {
  app_id: string;
  include_external_user_ids: string[];
  headings: { en: string };
  contents: { en: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
  url?: string;
}

export interface UserMapping {
  user_id: string;
  onesignal_id: string;
  device_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatNotificationData {
  receiverId: string;
  senderName: string;
  messagePreview: string;
  chatRoomId: string;
  messageId: string;
}

export interface RequestNotificationData {
  receiverId: string;
  senderName: string;
  message?: string;
}
