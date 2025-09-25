import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request);

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

    // 사용자가 참여한 그룹 채팅방 목록 조회 (최신 메시지 순으로 정렬)
    const { data: chatRooms, error } = await supabase
      .from('chat_rooms')
      .select(
        `
        id,
        room_name,
        room_image,
        participants,
        last_message,
        last_message_time
      `,
      )
      .eq('room_type', 'gathering')
      .contains('participants', [user.id])
      .order('last_message_time', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    // 각 그룹 채팅방의 unreadCount와 참여자 상세 정보 계산
    const chatRoomsWithDetails = await Promise.all(
      (chatRooms || []).map(async (room) => {
        // unreadCount 계산 (내가 안 읽은 메시지 개수)
        const { data: unreadMessages } = await supabase
          .from('messages')
          .select('id')
          .eq('chat_room_id', room.id)
          .eq('read', false)
          .neq('sender_id', user.id);

        // 참여자 상세 정보 조회
        const { data: participants } = await supabase
          .from('users')
          .select('id, name, image')
          .in('id', room.participants);

        const participantDetails =
          participants?.map((p) => ({
            id: p.id,
            name: p.name,
            image: p.image || '/default-traveler.png',
          })) || [];

        return {
          ...room,
          unreadCount: unreadMessages ? unreadMessages.length : 0,
          participant_count: room.participants.length,
          participant_details: participantDetails,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      chatRooms: chatRoomsWithDetails,
    });
  } catch (error) {
    console.error('Error fetching gathering chat rooms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
