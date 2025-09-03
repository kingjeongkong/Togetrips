// Firebase SDK import
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// FCM 전용 최소 Firebase 설정
// 빌드 시점에 실제 값으로 대체되도록 설정
const firebaseConfig = {
  projectId: 'togetrips-4b70e',
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// FCM 메시징 인스턴스
const messaging = firebase.messaging();

// 백그라운드에서 메시지 수신 시 처리
messaging.onBackgroundMessage((payload) => {
  console.log('백그라운드 메시지 수신:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/togetrips-logo.png',
    badge: '/togetrips-logo.png',
    data: payload.data,
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
    tag: payload.data?.type || 'default', // 알림 그룹화
  };

  // 알림 표시
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 시 처리
self.addEventListener('notificationclick', (event) => {
  console.log('알림 클릭:', event);

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // 앱 열기
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // 이미 열린 창이 있는지 확인
        for (const client of clientList) {
          if (client.url.includes('/') && 'focus' in client) {
            return client.focus();
          }
        }

        // 새 창 열기
        if (clients.openWindow) {
          const data = event.notification.data;
          let url = '/';

          // 알림 타입에 따라 적절한 페이지로 이동
          if (data?.type === 'chat' && data?.chatRoomId) {
            url = `/chat/${data.chatRoomId}`;
          } else if (data?.type === 'request') {
            url = '/request';
          }

          return clients.openWindow(url);
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
