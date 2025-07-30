export interface ChatRoom {
  id: string;
  participants: string[];
  createdAt: string;
  lastMessage: string;
  lastMessageTime: string;
}

export interface ChatRoomListItem extends ChatRoom {
  unreadCount: number;
  otherUser?: {
    id: string;
    name: string;
    image: string;
  } | null;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  pending?: boolean; // Optimistic UI: 임시 메시지 여부
  error?: boolean; // Optimistic UI: 전송 실패 여부
}
