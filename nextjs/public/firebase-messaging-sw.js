// Firebase SDK import
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// FCM 전용 Firebase 설정
// 빌드 시점에 실제 값으로 대체되도록 설정
const firebaseConfig = {
  apiKey: 'AIzaSyAo5IW4pb4n1zbJUxFGK3r7PdzljDp07MY', // Firebase 콘솔에서 복사한 API 키
  projectId: 'togetrips-4b70e',
  messagingSenderId: '69867659380',
  appId: '1:69867659380:web:d39f0bef27ba774b8bb121',
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// FCM 메시징 인스턴스
const messaging = firebase.messaging();

// Service Worker 버전 업데이트 (캐시 무효화)
const SW_VERSION = '3.0.1';
console.log('Service Worker version:', SW_VERSION);

// 백그라운드에서 메시지 수신 시 처리
messaging.onBackgroundMessage((payload) => {
  console.log('백그라운드 메시지 수신:', payload);

  // data payload에서 알림 정보 추출
  const notificationTitle = payload.data?.title || 'New notification';
  const notificationBody = payload.data?.body || '';
  const notificationType = payload.data?.type || 'default';
  const notificationUrl = payload.data?.url || '/';
  const notificationId = payload.data?.id || `${notificationType}-${Date.now()}`;
  const timestamp = payload.data?.timestamp || Date.now().toString();
  const source = payload.data?.source || 'unknown';

  // Togetrips API에서 온 메시지가 아니면 무시
  if (source !== 'togetrips-api') {
    console.log('Ignoring notification from unknown source:', source);
    return;
  }

  const notificationOptions = {
    body: notificationBody,
    icon: '/togetrips-logo.png',
    badge: '/togetrips-logo.png',
    data: {
      type: notificationType,
      url: notificationUrl,
      id: notificationId,
      timestamp: timestamp,
      chatRoomId: notificationType === 'chat' ? notificationUrl.split('/chat/')[1] : null,
    },
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
    requireInteraction: true,
    renotify: true,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 시 처리
self.addEventListener('notificationclick', (event) => {
  console.log('알림 클릭:', event);

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const data = event.notification.data;
    const targetUrl = data?.url || '/';

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // 이미 열린 창이 있는지 확인
        for (const client of clientList) {
          if (client.url.includes('/') && 'focus' in client) {
            // 기존 창이 있으면 클라이언트로 알림 클릭 이벤트 전달
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              url: targetUrl,
            });
            return client.focus();
          }
        }

        // 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
    );
  }
});

// 알림 닫기 시 처리
self.addEventListener('notificationclose', (event) => {
  console.log('알림 닫힘:', event);

  // 필요한 경우 서버에 알림 읽음 상태 업데이트
  const data = event.notification.data;
  if (data?.type && data?.id) {
    // 서버에 알림 상태 업데이트 요청
    fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId: data.id,
        type: data.type,
      }),
    }).catch(console.error);
  }
});
