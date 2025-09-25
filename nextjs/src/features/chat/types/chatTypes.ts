export interface BaseChatRoom {
  id: string;
  participants: string[];
  createdAt: string;
  lastMessage: string;
  lastMessageTime: string;
}

export interface ChatRoomUser {
  id: string;
  name: string;
  image: string | null;
}

export interface DirectChatRoom extends BaseChatRoom {
  otherUser: ChatRoomUser | null;
}

export interface DirectChatRoomListItem extends DirectChatRoom {
  unreadCount: number;
}

export interface GatheringChatRoom extends BaseChatRoom {
  roomName: string;
  roomImage: string | null;
  participantCount: number;
  participantDetails: ChatRoomUser[];
}

export interface GatheringChatRoomListItem extends GatheringChatRoom {
  unreadCount: number;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  pending?: boolean;
  error?: boolean;
}

export type ChatRoom = DirectChatRoom | GatheringChatRoom;
export type ChatRoomListItem = DirectChatRoomListItem | GatheringChatRoomListItem;
