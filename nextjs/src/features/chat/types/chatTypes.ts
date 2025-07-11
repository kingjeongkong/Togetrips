export interface ChatRoom {
  id: string;
  participants: string[];
  createdAt: string;
  lastMessage: string;
  lastMessageTime: string;
}

export interface ChatRoomListItem extends ChatRoom {
  unreadCount: number;
}

export interface Message {
  id: string;
  senderID: string;
  content: string;
  timestamp: string;
  read: boolean;
}
