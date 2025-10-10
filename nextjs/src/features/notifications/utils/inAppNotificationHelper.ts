import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { InAppNotification } from '../types/notification';

/**
 * 인앱 알림을 표시하는 헬퍼 함수
 * @param notification 인앱 알림 데이터
 * @param router Next.js 라우터 인스턴스
 */
export const showInAppNotification = (
  notification: InAppNotification,
  router: ReturnType<typeof useRouter>,
) => {
  const { type, title, message, chatRoomId, requestId, roomType } = notification;

  // 알림 클릭 핸들러
  const handleClick = () => {
    if (type === 'chat' && chatRoomId) {
      // 채팅방으로 이동 (room type에 따라 쿼리 파라미터 추가)
      const typeParam = roomType || 'direct'; // 기본값
      router.push(`/chat/${chatRoomId}?type=${typeParam}`);
    } else if (type === 'request' && requestId) {
      // 요청 페이지로 이동
      router.push('/request');
    }
  };

  // Toast 옵션 설정
  const toastOptions = {
    toastId: notification.id, // 중복 방지
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    onClick: handleClick,
    className: 'in-app-notification-toast',
    bodyClassName: 'in-app-notification-body',
  };

  // 알림 타입별 아이콘과 스타일
  const getNotificationIcon = () => {
    switch (type) {
      case 'chat':
        return '💬';
      case 'request':
        return '🔔';
    }
  };

  // Toast 표시 (간단한 텍스트로 표시)
  // TODO: 알림 UI 커스텀
  toast(`${getNotificationIcon()} ${title}${type === 'chat' ? ':' : ''} ${message}`, {
    ...toastOptions,
    onClick: handleClick,
  });
};

/**
 * 인앱 알림을 생성하는 헬퍼 함수
 * @param type 알림 타입
 * @param data 알림 데이터
 * @returns InAppNotification 객체
 */
export const createInAppNotification = (
  type: InAppNotification['type'],
  data: {
    title: string;
    message: string;
    senderName?: string;
    senderImage?: string;
    chatRoomId?: string;
    requestId?: string;
    roomType?: 'direct' | 'group';
  },
): InAppNotification => {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title: data.title,
    message: data.message,
    senderName: data.senderName,
    senderImage: data.senderImage,
    chatRoomId: data.chatRoomId,
    requestId: data.requestId,
    roomType: data.roomType,
    timestamp: Date.now(),
  };
};
