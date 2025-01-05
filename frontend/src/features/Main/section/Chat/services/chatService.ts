import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../../../../../config/firebase';
import { ChatRoom, Message } from '../types/chatTypes';

export const chatService = {
  async getChatRooms(userID: string): Promise<ChatRoom[]> {
    try {
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
    } catch (error) {
      // ToDo : 에러 처리
      console.error('Error fetching chat rooms:', error);
      return [];
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
      // ToDo : 에러 처리
      console.error('Error sending message:', error);
      return false;
    }
  },

  async getMessages(chatRoomID: string): Promise<Message[]> {
    try {
      const q = query(
        collection(db, `chatRooms/${chatRoomID}/messages`),
        orderBy('timestamp', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data()
          } as Message)
      );
    } catch (error) {
      // ToDo : 에러 처리
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  subscribeToMessages(chatRoomID: string, callback: (messages: Message[]) => void) {
    const q = query(
      collection(db, `chatRooms/${chatRoomID}/messages`),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data()
          } as Message)
      );
      callback(messages);
    });
  }
};
