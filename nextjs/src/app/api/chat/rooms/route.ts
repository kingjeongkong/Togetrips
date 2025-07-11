import { authOptions } from '@/lib/next-auth-config';
import { createServerSupabaseClient } from '@/lib/supabase-config';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();

    // 사용자가 참여한 채팅방 목록 조회 (최신 메시지 순으로 정렬)
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
      .contains('participants', [session.user.id])
      .order('last_message_time', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    // 각 채팅방의 unreadCount(내가 안 읽은 메시지 개수) 집계
    // ToDo : Supabase에서 집계 쿼리 적용(N+1 문제 해결)
    const chatRoomsWithUnread = await Promise.all(
      (chatRooms || []).map(async (room) => {
        const { data: unreadMessages } = await supabase
          .from('messages')
          .select('id')
          .eq('chat_room_id', room.id)
          .eq('read', false)
          .neq('sender_id', session.user.id);
        return {
          ...room,
          unreadCount: unreadMessages ? unreadMessages.length : 0,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      chatRooms: chatRoomsWithUnread,
    });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
