export interface DirectChatRoom {
  id: string;
  participants: string[];
  createdAt: string;
  lastMessage: string;
  lastMessageTime: string;
  otherUser: {
    id: string;
    name: string;
    image: string | null;
  } | null;
}

export interface DirectChatRoomListItem extends DirectChatRoom {
  unreadCount: number;
}

// 그룹 채팅방을 위한 타입 정의
export interface GatheringChatRoom {
  id: string;
  room_name: string;
  room_image: string | null;
  participants: string[]; // 참여자 ID 목록
  last_message: string | null;
  last_message_time: string | null;
  participant_count: number;
  participant_details: Array<{
    id: string;
    name: string;
    image: string;
  }>; // 참여자 상세 정보
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
  pending?: boolean; // Optimistic UI: 임시 메시지 여부
  error?: boolean; // Optimistic UI: 전송 실패 여부
}
