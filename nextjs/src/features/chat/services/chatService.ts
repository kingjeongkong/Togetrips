import { db } from '@/lib/firebase-config';
import { collection, doc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { ChatRoom, Message } from '../types/chatTypes';

export const chatService = {
  // 채팅방 목록 조회
  async getChatRooms(userID: string): Promise<ChatRoom[]> {
    try {
      const response = await fetch('/api/chat/rooms', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch chat rooms');
      }

      const result = await response.json();
      return result.chatRooms.map((room: any) => ({
        id: room.id,
        participants: room.participants,
        createdAt: room.created_at,
        lastMessage: room.last_message || '',
        lastMessageTime: room.last_message_time || room.created_at,
      }));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching chat rooms:', error);
      }
      toast.error('Failed to fetch chat rooms');
      return [];
    }
  },

  // 특정 채팅방 정보 조회
  async getChatRoom(chatRoomID: string): Promise<ChatRoom | null> {
    try {
      const response = await fetch(`/api/chat/rooms/${chatRoomID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch chat room');
      }

      const result = await response.json();
      const room = result.chatRoom;

      return {
        id: room.id,
        participants: room.participants,
        createdAt: room.created_at,
        lastMessage: room.last_message || '',
        lastMessageTime: room.last_message_time || room.created_at,
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching chat room:', error);
      }
      toast.error('Failed to fetch chat room');
      return null;
    }
  },

  // 메시지 읽음 처리
  async markMessagesAsRead(chatRoomID: string, retries = 3): Promise<void> {
    try {
      const response = await fetch('/api/chat/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatRoomID,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark messages as read');
      }

      const result = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log(`Marked ${result.updatedCount} messages as read`);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error marking messages as read:', error);
      }

      if (retries > 0) {
        setTimeout(() => {
          this.markMessagesAsRead(chatRoomID, retries - 1);
        }, 500);
      }
    }
  },

  // 메시지 전송
  async sendMessage(chatRoomID: string, content: string): Promise<boolean> {
    try {
      const response = await fetch('/api/chat/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatRoomID,
          content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error sending message:', error);
      }
      toast.error('Failed to send message');
      return false;
    }
  },

  // 실시간 메시지 구독 (Firebase 방식 유지)
  subscribeToMessages(
    chatRoomID: string,
    onMessage: (messages: Message[]) => void,
    onError?: (failedCount: number) => void,
    retries = 3,
    failedCount = 0,
  ) {
    const q = query(
      collection(db, `chatRooms/${chatRoomID}/messages`),
      orderBy('timestamp', 'asc'),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Message,
        );
        onMessage(messages);
      },
      (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error in messages subscription:', error);
        }

        toast.error('Failed to fetch messages');
        onError?.(failedCount);

        if (retries > 0) {
          setTimeout(() => {
            this.subscribeToMessages(chatRoomID, onMessage, onError, retries - 1, failedCount + 1);
          }, 500);
        }
      },
    );
  },

  // 읽지 않은 메시지 수 구독 (Firebase 방식 유지)
  subscribeToUnreadCount(chatRoomID: string, userID: string, callback: (count: number) => void) {
    const q = query(
      collection(db, `chatRooms/${chatRoomID}/messages`),
      where('senderID', '!=', userID),
      where('read', '==', false),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        callback(snapshot.docs.length);
      },
      (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching unread count:', error);
        }
        callback(0);
      },
    );
  },

  // 마지막 메시지 구독 (Firebase 방식 유지)
  subscribeToLastMessage(
    chatRoomID: string,
    callback: (data: { lastMessage: string; lastMessageTime: string }) => void,
  ) {
    const chatRoomRef = doc(db, 'chatRooms', chatRoomID);

    return onSnapshot(
      chatRoomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          callback({
            lastMessage: data.lastMessage,
            lastMessageTime: data.lastMessageTime,
          });
        }
      },
      (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching last message:', error);
        }
        callback({
          lastMessage: '',
          lastMessageTime: '',
        });
      },
    );
  },
};
