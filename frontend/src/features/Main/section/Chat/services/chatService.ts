import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../../../../config/firebase';
import { ChatRoom, Message } from '../types/chatTypes';
import { toast } from 'react-toastify';

export const chatService = {
  async getChatRooms(userID: string): Promise<ChatRoom[]> {
    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', userID),
      orderBy('lastMessageTime', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data()
        } as ChatRoom)
    );
  },

  async getChatRoom(chatRoomID: string): Promise<ChatRoom | null> {
    const docRef = doc(db, 'chatRooms', chatRoomID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as ChatRoom;
    }

    return null;
  },

  async markMessagesAsRead(
    chatRoomID: string,
    userID: string,
    retries = 3
  ): Promise<void> {
    try {
      const q = query(
        collection(db, `chatRooms/${chatRoomID}/messages`),
        where('senderID', '!=', userID),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error marking messages as read:', error);
      }

      if (retries > 0) {
        setTimeout(() => {
          this.markMessagesAsRead(chatRoomID, userID, retries - 1);
        }, 500);
      }
    }
  },

  async sendMessage(
    chatRoomID: string,
    senderID: string,
    content: string
  ): Promise<boolean> {
    try {
      const newMessage = {
        senderID,
        content,
        timestamp: new Date().toISOString(),
        read: false
      };

      await addDoc(collection(db, `chatRooms/${chatRoomID}/messages`), newMessage);

      await updateDoc(doc(db, 'chatRooms', chatRoomID), {
        lastMessage: content,
        lastMessageTime: new Date().toISOString()
      });

      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error sending message:', error);
      }
      toast.error('Failed to send message');
      return false;
    }
  },

  subscribeToMessages(
    chatRoomID: string,
    onMessage: (messages: Message[]) => void,
    onError?: (failedCount: number) => void,
    retries = 3,
    failedCount = 0
  ) {
    const q = query(
      collection(db, `chatRooms/${chatRoomID}/messages`),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data()
            } as Message)
        );
        onMessage(messages);
      },
      (error) => {
        if (import.meta.env.DEV) {
          console.error('Error in messages subscription:', error);
        }

        onError?.(failedCount);

        if (retries > 0) {
          setTimeout(() => {
            this.subscribeToMessages(
              chatRoomID,
              onMessage,
              onError,
              retries - 1,
              failedCount + 1
            );
          }, 500);
        }
      }
    );
  },

  subscribeToUnreadCount(
    chatRoomID: string,
    userID: string,
    callback: (count: number) => void
  ) {
    const q = query(
      collection(db, `chatRooms/${chatRoomID}/messages`),
      where('senderID', '!=', userID),
      where('read', '==', false)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        callback(snapshot.docs.length);
      },
      (error) => {
        // ToDo : 에러 처리
        console.error('Error fetching unread count:', error);
        callback(0);
      }
    );
  },

  subscribeToLastMessage(
    chatRoomID: string,
    callback: (data: { lastMessage: string; lastMessageTime: string }) => void
  ) {
    const chatRoomRef = doc(db, 'chatRooms', chatRoomID);

    return onSnapshot(chatRoomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback({
          lastMessage: data.lastMessage,
          lastMessageTime: data.lastMessageTime
        });
      }
    });
  }
};
