import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

// 읽음 처리 REST API (함수 분리 없이 통합)
export async function POST(request: NextRequest) {
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

    const { chatRoomID } = await request.json();

    if (!chatRoomID) {
      return NextResponse.json({ error: 'Chat room ID is required' }, { status: 400 });
    }

    const { data: chatRoom, error: chatRoomError } = await supabase
      .from('chat_rooms')
      .select('id, participants')
      .eq('id', chatRoomID)
      .single();

    if (chatRoomError || !chatRoom) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    if (!chatRoom.participants.includes(user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { error: upsertError } = await supabase.from('chat_read_status').upsert(
      {
        chat_room_id: chatRoomID,
        user_id: user.id,
        last_read_at: new Date().toISOString(),
      },
      {
        onConflict: 'chat_room_id, user_id',
      },
    );

    if (upsertError) {
      throw new Error(upsertError.message);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    // 서버 내부 오류 처리
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
