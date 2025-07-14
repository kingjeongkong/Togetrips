import { createServerSupabaseClient } from '@/lib/supabase-config';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request);

    // Supabase 세션 확인
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatRoomID } = await request.json();

    // 입력 검증
    if (!chatRoomID) {
      return NextResponse.json({ error: 'Chat room ID is required' }, { status: 400 });
    }

    // 채팅방 존재 및 참가자 검증
    const { data: chatRoom, error: chatRoomError } = await supabase
      .from('chat_rooms')
      .select('id, participants')
      .eq('id', chatRoomID)
      .single();

    if (chatRoomError || !chatRoom) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    if (!chatRoom.participants.includes(session.user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // 읽지 않은 메시지 조회 (자신이 보낸 메시지 제외)
    const { data: unreadMessages, error: unreadError } = await supabase
      .from('messages')
      .select('id')
      .eq('chat_room_id', chatRoomID)
      .eq('read', false)
      .neq('sender_id', session.user.id);

    if (unreadError) {
      throw new Error(unreadError.message);
    }

    if (!unreadMessages || unreadMessages.length === 0) {
      return NextResponse.json({ success: true, updatedCount: 0 });
    }

    // 읽지 않은 메시지들 일괄 업데이트
    const ids = unreadMessages.map((msg) => msg.id);
    const { error: updateError } = await supabase
      .from('messages')
      .update({ read: true })
      .in('id', ids);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({
      success: true,
      updatedCount: ids.length,
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
