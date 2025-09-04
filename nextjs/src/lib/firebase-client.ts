import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';

// FCM 전용 Firebase 설정
const firebaseConfig = {
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// FCM 메시징 인스턴스 생성 (지원되는 경우에만)
export const getMessagingInstance = async () => {
  if (await isSupported()) {
    return getMessaging(app);
  }
  return null;
};

// FCM 토큰 획득 함수
export const getFCMToken = async () => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) {
      throw new Error('FCM is not supported in this browser');
    }

    // 웹 푸시 인증서 공개 키로 토큰 요청
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (!token) {
      throw new Error('No registration token available');
    }

    return token;
  } catch (error) {
    console.error('FCM 토큰 획득 실패:', error);
    throw error;
  }
};

export default app;
