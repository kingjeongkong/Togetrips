import { toast } from 'react-toastify';
import {
  DirectChatRoomApiResponse,
  DirectChatRoomListItem,
  GatheringChatRoomApiResponse,
  GatheringChatRoomListItem,
  Message,
  MessagePagination,
} from '../types/chatTypes';

export const chatApiService = {
  // 1:1 채팅방 목록 조회
  async getDirectChatRooms(): Promise<DirectChatRoomListItem[]> {
    try {
      const response = await fetch('/api/chat/rooms/direct', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch direct chat rooms');
      }

      const result = await response.json();
      return result.chatRooms.map((room: Record<string, unknown>) => ({
        id: room.id,
        participants: room.participants,
        createdAt: room.created_at,
        lastMessage: room.last_message || '',
        lastMessageTime: room.last_message_time || room.created_at,
        unreadCount: room.unreadCount ?? 0,
        otherUser: room.otherUser || null,
      }));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching direct chat rooms:', error);
      }
      toast.error('Failed to fetch direct chat rooms');
      return [];
    }
  },

  // 그룹 채팅방 목록 조회
  async getGatheringChatRooms(): Promise<GatheringChatRoomListItem[]> {
    try {
      const response = await fetch('/api/chat/rooms/gathering', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch gathering chat rooms');
      }

      const result = await response.json();
      return result.chatRooms.map((room: Record<string, unknown>) => ({
        id: room.id,
        roomName: room.room_name,
        roomImage: room.room_image,
        participants: room.participants,
        lastMessage: room.last_message,
        lastMessageTime: room.last_message_time,
        participantCount: room.participant_count,
        participantDetails: room.participant_details || [],
        unreadCount: room.unreadCount ?? 0,
      }));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching gathering chat rooms:', error);
      }
      toast.error('Failed to fetch gathering chat rooms');
      return [];
    }
  },

  // 개별 채팅방 조회 (메시지 포함)
  async getDirectChatRoomWithInitialMessages(
    chatRoomID: string,
  ): Promise<DirectChatRoomApiResponse> {
    try {
      const response = await fetch(`/api/chat/rooms/direct/${chatRoomID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch chat room with messages');
      }

      const room = await response.json();
      return {
        id: room.id,
        otherUser: room.otherUser || null,
        messages: room.messages.map((message: Record<string, unknown>) => ({
          id: message.id as string,
          senderId: message.sender_id as string,
          content: message.content as string,
          timestamp: message.timestamp as string,
        })),
        unreadCount: room.unread_count ?? 0,
        paginationInfo: room.paginationInfo || undefined,
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching chat room with messages:', error);
      }
      throw error;
    }
  },

  // 그룹 채팅방 조회 (메시지 포함)
  async getGroupChatRoomWithInitialMessages(
    chatRoomID: string,
  ): Promise<GatheringChatRoomApiResponse> {
    try {
      const response = await fetch(`/api/chat/rooms/gathering/${chatRoomID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch chat room with messages');
      }

      const result = await response.json();
      const room = result.chatRoom;
      return {
        id: room.id,
        gatheringId: room.gathering_id,
        isHost: room.is_host,
        roomName: room.room_name,
        roomImage: room.room_image,
        participants: room.participants,
        messages: room.messages.map((message: Record<string, unknown>) => ({
          id: message.id as string,
          senderId: message.sender_id as string,
          content: message.content as string,
          timestamp: message.timestamp as string,
        })),
        participantCount: room.participant_count,
        participantDetails: room.participants_details,
        unreadCount: room.unread_count ?? 0,
        paginationInfo: room.paginationInfo || undefined,
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching chat room with messages:', error);
      }
      throw error;
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
  async sendMessage(chatRoomID: string, content: string): Promise<Message | null> {
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

      const result = await response.json();

      return result.message;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error sending message:', error);
      }
      toast.error('Failed to send message');
      return null;
    }
  },

  // 채팅방 삭제
  async deleteChatRoom(chatRoomId: string): Promise<void> {
    const response = await fetch(`/api/chat/rooms/direct/${chatRoomId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete chat room');
    }
  },

  async getTotalUnreadCount(): Promise<number> {
    try {
      const response = await fetch('/api/chat/unread-count', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching total unread count:', errorData);
      }

      const data = await response.json();
      return data.unreadCount;
    } catch (error) {
      console.error('Error fetching total unread count:', error);
      return 0;
    }
  },

  // 사용자가 참여한 채팅방 정보 조회 (중앙 구독용)
  async getMyChatRoomInfo(): Promise<Map<string, 'direct' | 'gathering'>> {
    try {
      const response = await fetch('/api/chat/my-rooms');
      if (!response.ok) {
        throw new Error('Failed to fetch user chat room info');
      }
      const data = await response.json();
      // API에서 받은 배열을 다시 Map으로 변환하여 반환
      return new Map(data.chatRooms);
    } catch (error) {
      console.error('Error fetching user chat room info:', error);
      return new Map(); // 에러 발생 시 빈 맵 반환
    }
  },

  async getDirectChatMessagesOnly(
    chatRoomID: string,
    before?: string | null,
  ): Promise<MessagePagination> {
    try {
      const params = new URLSearchParams();
      if (before) {
        params.append('before', before);
      }

      const response = await fetch(`/api/chat/rooms/direct/${chatRoomID}/messages?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch messages');
      }

      const data = await response.json();
      return {
        messages: data.messages.map((message: Record<string, unknown>) => ({
          id: message.id as string,
          chatRoomId: chatRoomID,
          senderId: message.sender_id as string,
          content: message.content as string,
          timestamp: message.timestamp as string,
        })),
        paginationInfo: {
          hasMore: data.hasMore || false,
          nextCursor: data.nextCursor || null,
        },
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching direct chat messages only:', error);
      }
      throw error;
    }
  },

  async getGatheringChatMessagesOnly(
    chatRoomID: string,
    before?: string | null,
  ): Promise<MessagePagination> {
    try {
      const params = new URLSearchParams();
      if (before) {
        params.append('before', before);
      }

      const response = await fetch(`/api/chat/rooms/gathering/${chatRoomID}/messages?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch messages');
      }

      const data = await response.json();
      return {
        messages: data.messages.map((message: Record<string, unknown>) => ({
          id: message.id as string,
          chatRoomId: chatRoomID,
          senderId: message.sender_id as string,
          content: message.content as string,
          timestamp: message.timestamp as string,
        })),
        paginationInfo: {
          hasMore: data.hasMore || false,
          nextCursor: data.nextCursor || null,
        },
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching gathering chat messages only:', error);
      }
      throw error;
    }
  },
};
