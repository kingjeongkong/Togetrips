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

    // 사용자가 참여한 모든 채팅방의 ID와 타입만 조회
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('id, room_type')
      .contains('participants', [user.id]);

    if (error) throw error;

    // Map 형태로 가공하여 반환하면 클라이언트에서 사용하기 더 편리합니다.
    const chatRoomsMap = new Map(data.map((room) => [room.id, room.room_type]));

    // JSON은 Map을 직접 지원하지 않으므로, 배열 형태로 변환하여 전송합니다.
    return NextResponse.json({ chatRooms: Array.from(chatRoomsMap.entries()) });
  } catch (error) {
    console.error('Error fetching user chat rooms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
