import { toast } from 'react-toastify';
import {
  DirectChatRoomApiResponse,
  DirectChatRoomListItem,
  GatheringChatRoomApiResponse,
  GatheringChatRoomListItem,
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
  async getDirectChatRoomWithMessages(chatRoomID: string): Promise<DirectChatRoomApiResponse> {
    try {
      const response = await fetch(`/api/chat/rooms/${chatRoomID}`, {
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
          read: message.read as boolean,
        })),
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching chat room with messages:', error);
      }
      throw error;
    }
  },

  // 그룹 채팅방 조회 (메시지 포함)
  async getGroupChatRoomWithMessages(chatRoomID: string): Promise<GatheringChatRoomApiResponse> {
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
        roomName: room.room_name,
        roomImage: room.room_image,
        participants: room.participants,
        messages: room.messages.map((message: Record<string, unknown>) => ({
          id: message.id as string,
          senderId: message.sender_id as string,
          content: message.content as string,
          timestamp: message.timestamp as string,
          read: message.read as boolean,
        })),
        participantCount: room.participant_count,
        participantDetails: room.participants_details,
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching chat room with messages:', error);
      }
      throw error;
    }
  },

  // 1:1 채팅 메시지 읽음 처리
  async markMessagesAsRead(chatRoomID: string, retries = 3): Promise<void> {
    try {
      const response = await fetch('/api/chat/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatRoomID,
          roomType: 'direct', // 1:1 채팅임을 명시
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

  // 그룹 채팅 메시지 읽음 처리
  async markGroupMessagesAsRead(chatRoomID: string, retries = 3): Promise<void> {
    try {
      const response = await fetch('/api/chat/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatRoomID,
          roomType: 'group', // 그룹 채팅임을 명시
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark group messages as read');
      }

      const result = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log(`Marked group chat messages as read: ${result.success}`);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error marking group messages as read:', error);
      }

      if (retries > 0) {
        setTimeout(() => {
          this.markGroupMessagesAsRead(chatRoomID, retries - 1);
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

  // 채팅방 삭제
  async deleteChatRoom(chatRoomId: string): Promise<void> {
    const response = await fetch(`/api/chat/rooms/${chatRoomId}`, {
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
};
