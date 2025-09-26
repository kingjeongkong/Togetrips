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

// API 응답 타입들 (실제 반환되는 데이터만)
export interface DirectChatRoomApiResponse {
  id: string;
  otherUser: ChatRoomUser | null;
  messages: Message[];
}

export interface GatheringChatRoomApiResponse {
  id: string;
  roomName: string;
  roomImage: string | null;
  participants: string[];
  participantCount: number;
  participantDetails: ChatRoomUser[];
  messages: Message[];
}

// Union 타입들
export type ChatRoom = DirectChatRoom | GatheringChatRoom;
export type ChatRoomListItem = DirectChatRoomListItem | GatheringChatRoomListItem;
export type ChatRoomWithMessages = DirectChatRoomApiResponse | GatheringChatRoomApiResponse;
