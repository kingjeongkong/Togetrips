import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';
import { calculateUnreadCount } from '../_utils/calculateUnreadCount';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request);

    const pathname = request.nextUrl.pathname;
    const chatRoomID = pathname.split('/').pop();

    if (!chatRoomID) {
      return NextResponse.json({ error: 'Chat room ID is required' }, { status: 400 });
    }

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

    // 사용자가 참여한 모든 채팅방 조회
    const { data: chatRooms } = await supabase
      .from('chat_rooms')
      .select('id, created_at')
      .contains('participants', [user.id]);

    if (!chatRooms || chatRooms.length === 0) {
      return NextResponse.json({ unreadCount: 0 });
    }

    // 모든 채팅방의 unread count 계산
    const unreadCounts = await Promise.all(
      chatRooms.map((room) => calculateUnreadCount(supabase, user.id, room.id, room.created_at)),
    );

    const totalUnreadCount = unreadCounts.reduce((sum, count) => sum + count, 0);

    return NextResponse.json({ unreadCount: totalUnreadCount });
  } catch (error) {
    console.error('Error calculating total unread count:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
