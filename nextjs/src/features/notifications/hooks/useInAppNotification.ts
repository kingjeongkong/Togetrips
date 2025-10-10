'use client';

import { useRealtimeStore } from '@/stores/realtimeStore';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { InAppNotification, InAppNotificationType } from '../types/notification';
import { createInAppNotification, showInAppNotification } from '../utils/inAppNotificationHelper';

/**
 * 인앱 알림을 관리하는 훅
 * 알림 설정 확인, 현재 활성 상태 확인, Toast 알림 트리거 기능 제공
 */
export const useInAppNotification = () => {
  const router = useRouter();
  const { activeChatRoomId } = useRealtimeStore();

  // 앱이 활성 상태인지 확인
  const isAppActive = useCallback(() => {
    // 1. 문서가 숨겨져 있지 않아야 함
    if (document.visibilityState === 'hidden') {
      return false;
    }

    return true;
  }, []);

  // 알림 표시 조건 확인
  const shouldShowNotification = useCallback(
    (type: InAppNotificationType, chatRoomId?: string) => {
      // 1. 앱이 활성 상태인지 확인
      if (!isAppActive()) {
        return false;
      }

      // 2. 채팅 알림의 경우 현재 보고 있는 채팅방이 아닌지 확인
      if (type === 'chat' && chatRoomId && activeChatRoomId === chatRoomId) {
        return false;
      }

      return true;
    },
    [isAppActive, activeChatRoomId],
  );

  // 인앱 알림 표시 함수
  const showNotification = useCallback(
    (notification: InAppNotification) => {
      const { type, chatRoomId } = notification;

      if (!shouldShowNotification(type, chatRoomId)) {
        return;
      }

      showInAppNotification(notification, router);
    },
    [shouldShowNotification, router],
  );

  // 채팅 메시지 알림 표시
  const showChatNotification = useCallback(
    (data: {
      title: string;
      message: string;
      senderName?: string;
      senderImage?: string;
      chatRoomId: string;
      roomType?: 'direct' | 'group';
    }) => {
      const notification = createInAppNotification('chat', {
        title: data.title,
        message: data.message,
        senderName: data.senderName,
        senderImage: data.senderImage,
        chatRoomId: data.chatRoomId,
        roomType: data.roomType,
      });

      showNotification(notification);
    },
    [showNotification],
  );

  // 요청 알림 표시
  const showRequestNotification = useCallback(
    (data: {
      title: string;
      message: string;
      senderName?: string;
      senderImage?: string;
      requestId: string;
    }) => {
      const notification = createInAppNotification('request', {
        title: data.title,
        message: data.message,
        senderName: data.senderName,
        senderImage: data.senderImage,
        requestId: data.requestId,
      });

      showNotification(notification);
    },
    [showNotification],
  );

  // 모든 인앱 알림 닫기
  const dismissAllNotifications = useCallback(() => {
    toast.dismiss();
  }, []);

  // 특정 알림 닫기
  const dismissNotification = useCallback((notificationId: string) => {
    toast.dismiss(notificationId);
  }, []);

  return {
    showChatNotification,
    showRequestNotification,
    dismissAllNotifications,
    dismissNotification,
    shouldShowNotification,
  };
};
