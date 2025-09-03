import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Firebase Admin SDK 초기화 (이미 초기화된 경우 재사용)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

// FCM 메시징 인스턴스 반환
export const getAdminMessaging = () => getMessaging();

// 메시지 페이로드를 생성하는 private 헬퍼 함수
const _buildMessagePayload = (
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  },
  data?: Record<string, string>,
) => {
  return {
    notification,
    data,
    webpush: {
      headers: {
        Urgency: 'high',
      },
      notification: {
        ...notification,
        icon: '/togetrips-logo.png',
        badge: '/togetrips-logo.png',
        actions: [
          {
            action: 'open',
            title: '열기',
          },
          {
            action: 'close',
            title: '닫기',
          },
        ],
      },
    },
  };
};

// FCM 푸시 알림 전송 함수 (단일)
export const sendPushNotification = async (
  token: string,
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  },
  data?: Record<string, string>,
) => {
  try {
    // 헬퍼 함수를 사용하여 페이로드 생성
    const messagePayload = _buildMessagePayload(notification, data);

    const message = {
      token,
      ...messagePayload,
    };

    const response = await getAdminMessaging().send(message);
    console.log('푸시 알림 전송 성공:', response);
    return response;
  } catch (error) {
    console.error('푸시 알림 전송 실패:', error);
    throw error;
  }
};

// 여러 토큰에 효율적인 배치 전송 (sendEachForMulticast 사용)
export const sendPushNotificationToMultipleTokens = async (
  tokens: string[],
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  },
  data?: Record<string, string>,
) => {
  try {
    // 헬퍼 함수를 사용하여 페이로드 생성
    const messagePayload = _buildMessagePayload(notification, data);

    const message = {
      tokens,
      ...messagePayload,
    };

    // sendEachForMulticast를 사용한 효율적인 배치 전송
    const response = await getAdminMessaging().sendEachForMulticast(message);

    console.log('배치 푸시 알림 전송 결과:', {
      successCount: response.successCount,
      failureCount: response.failureCount,
      totalTokens: tokens.length,
      responses: response.responses,
    });

    // 실패한 토큰들에 대한 상세 정보 로깅
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`토큰 ${tokens[idx]} 전송 실패:`, resp.error);
        }
      });
    }

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      totalTokens: tokens.length,
      responses: response.responses,
    };
  } catch (error) {
    console.error('배치 푸시 알림 전송 실패:', error);
    throw error;
  }
};
