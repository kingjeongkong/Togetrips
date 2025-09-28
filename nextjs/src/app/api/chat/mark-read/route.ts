import { createServerSupabaseClient } from '@/lib/supabase-config';

import { NextRequest, NextResponse } from 'next/server';

// Direct Chat 읽음 처리 (기존 로직 유지)
async function handleDirectChatRead(supabase: any, chatRoomID: string, userId: string) {
  // 읽지 않은 메시지 조회 (자신이 보낸 메시지 제외)
  const { data: unreadMessages, error: unreadError } = await supabase
    .from('messages')
    .select('id')
    .eq('chat_room_id', chatRoomID)
    .eq('read', false)
    .neq('sender_id', userId);

  if (unreadError) {
    throw new Error(unreadError.message);
  }

  if (!unreadMessages || unreadMessages.length === 0) {
    return { success: true, updatedCount: 0 };
  }

  // 읽지 않은 메시지들 일괄 업데이트
  const ids = unreadMessages.map((msg: any) => msg.id);
  const { error: updateError } = await supabase
    .from('messages')
    .update({ read: true })
    .in('id', ids);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return {
    success: true,
    updatedCount: ids.length,
  };
}

// Group Chat 읽음 처리 (새로운 로직)
async function handleGroupChatRead(supabase: any, chatRoomID: string, userId: string) {
  // chat_read_status 테이블에 현재 시간으로 UPSERT
  const { error } = await supabase.from('chat_read_status').upsert(
    {
      chat_room_id: chatRoomID,
      user_id: userId,
      last_read_at: new Date().toISOString(),
    },
    {
      onConflict: 'chat_room_id, user_id',
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    updatedCount: 0, // Group Chat에서는 개별 메시지 업데이트가 아닌 시점 업데이트
  };
}

export async function POST(request: NextRequest) {
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

    const { chatRoomID, roomType } = await request.json();

    // 입력 검증
    if (!chatRoomID) {
      return NextResponse.json({ error: 'Chat room ID is required' }, { status: 400 });
    }

    // 채팅방 존재 및 참가자 검증
    const { data: chatRoom, error: chatRoomError } = await supabase
      .from('chat_rooms')
      .select('id, participants, room_type')
      .eq('id', chatRoomID)
      .single();

    if (chatRoomError || !chatRoom) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    if (!chatRoom.participants.includes(user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // 🔽 하이브리드 로직: 채팅방 타입에 따라 분기 처리
    const actualRoomType = roomType || chatRoom.room_type;

    if (actualRoomType === 'direct') {
      // Direct Chat: 기존 로직 사용
      const result = await handleDirectChatRead(supabase, chatRoomID, user.id);
      return NextResponse.json(result);
    } else {
      // Group Chat: 새로운 로직 사용
      const result = await handleGroupChatRead(supabase, chatRoomID, user.id);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
