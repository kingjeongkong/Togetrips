import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request);

    // Supabase 세션 확인
    const {
      data: { session },
    } = await supabase.auth.getSession();

    let user = null;
    if (session?.access_token) {
      const { data, error } = await supabase.auth.getUser(session.access_token);
      if (!error) {
        user = data.user;
      }
    }
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 사용자가 참여한 1:1 채팅방 목록 조회 (최신 메시지 순으로 정렬)
    const { data: chatRooms, error } = await supabase
      .from('chat_rooms')
      .select(
        `
        id,
        participants,
        created_at,
        last_message,
        last_message_time
      `,
      )
      .eq('room_type', 'direct')
      .contains('participants', [user.id])
      .order('last_message_time', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    // 각 1:1 채팅방의 unreadCount(내가 안 읽은 메시지 개수) 집계 및 상대방 프로필 정보 조회
    const chatRoomsWithUnreadAndProfiles = await Promise.all(
      (chatRooms || []).map(async (room) => {
        // unreadCount 계산
        const { data: unreadMessages } = await supabase
          .from('messages')
          .select('id')
          .eq('chat_room_id', room.id)
          .eq('read', false)
          .neq('sender_id', user.id);

        // 상대방 ID 찾기
        const otherUserId = room.participants.find((id: string) => id !== user.id);

        // 상대방 프로필 정보 조회
        let otherUserProfile = null;
        if (otherUserId) {
          const { data: profile } = await supabase
            .from('users')
            .select('id, name, image')
            .eq('id', otherUserId)
            .single();
          otherUserProfile = profile;
        }

        return {
          ...room,
          unreadCount: unreadMessages ? unreadMessages.length : 0,
          otherUser: otherUserProfile
            ? {
                id: otherUserProfile.id,
                name: otherUserProfile.name,
                image: otherUserProfile.image || '/default-traveler.png',
              }
            : null,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      chatRooms: chatRoomsWithUnreadAndProfiles,
    });
  } catch (error) {
    console.error('Error fetching direct chat rooms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
