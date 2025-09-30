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
        created_at,
        last_message,
        last_message_time,
        gatherings!inner(id, gathering_time)
      `,
      )
      .eq('room_type', 'gathering')
      .contains('participants', [user.id])
      .gte('gatherings.gathering_time', new Date().toISOString())
      .order('last_message_time', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    // 시점 기반 정확한 unreadCount 계산 (그룹 채팅)
    const chatRoomsWithDetails = await Promise.all(
      (chatRooms || []).map(async (room) => {
        // 1. 이 채팅방에 대한 나의 마지막 읽은 시간(last_read_at)을 가져옵니다.
        const { data: readStatus } = await supabase
          .from('chat_read_status')
          .select('last_read_at')
          .eq('chat_room_id', room.id)
          .eq('user_id', user.id)
          .single();

        // 마지막으로 읽은 시간이 없다면, 채팅방 생성 시간을 기준으로 합니다.
        const lastReadAt = readStatus?.last_read_at || room.created_at;

        // 2. 마지막으로 읽은 시간 이후에, 내가 보내지 않은 메시지의 개수를 셉니다.
        const { count, error: unreadError } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true }) // count만 가져옵니다.
          .eq('chat_room_id', room.id)
          .neq('sender_id', user.id) // 내가 보내지 않은 메시지
          .gt('timestamp', lastReadAt); // 내가 마지막으로 읽은 시간 이후의 메시지

        if (unreadError) {
          console.error(`Error counting unread messages for group room ${room.id}:`, unreadError);
        }

        // 3. 참여자 상세 정보 조회
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
          unreadCount: count || 0,
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
