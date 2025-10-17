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
  chatRoomId: string;
  senderId: string;
  content: string;
  timestamp: string;
  pending?: boolean;
  error?: boolean;
}

// 페이징 정보 타입
export interface PaginationInfo {
  hasMore: boolean;
  nextCursor: string | null;
}

// API 응답 타입들 (실제 반환되는 데이터만)
export interface DirectChatRoomApiResponse {
  id: string;
  otherUser: ChatRoomUser | null;
  messages: Message[];
  unreadCount: number;
  paginationInfo?: PaginationInfo;
}

export interface GatheringChatRoomApiResponse {
  id: string;
  roomName: string;
  roomImage: string | null;
  participants: string[];
  participantCount: number;
  participantDetails: ChatRoomUser[];
  messages: Message[];
  unreadCount: number;
  paginationInfo?: PaginationInfo;
  gatheringId: string;
  isHost: boolean;
}

// 무한 스크롤을 위한 메시지 페이지 타입
export interface MessagePagination {
  messages: Message[];
  paginationInfo?: PaginationInfo;
}

// Union 타입들
export type ChatRoom = DirectChatRoom | GatheringChatRoom;
export type ChatRoomListItem = DirectChatRoomListItem | GatheringChatRoomListItem;
export type ChatRoomWithMessages = DirectChatRoomApiResponse | GatheringChatRoomApiResponse;
// useInfiniteQuery의 pages 배열에 사용되는 타입
export type ChatRoomPage =
  | DirectChatRoomApiResponse
  | GatheringChatRoomApiResponse
  | MessagePagination;
