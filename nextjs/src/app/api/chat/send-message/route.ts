import { createServerSupabaseClient } from '@/lib/supabase-config';

import { NextRequest, NextResponse } from 'next/server';

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

    const { chatRoomID, content } = await request.json();

    // 입력 검증
    if (!chatRoomID || !content) {
      return NextResponse.json({ error: 'Chat room ID and content are required' }, { status: 400 });
    }

    // 메시지 내용 검증
    if (typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 });
    }

    // XSS 방지를 위한 기본적인 검증
    const dangerousPatterns = /<script|javascript:|on\w+\s*=|data:text\/html/i;
    if (dangerousPatterns.test(content)) {
      return NextResponse.json({ error: 'Invalid message content' }, { status: 400 });
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

    if (!chatRoom.participants.includes(user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // 새 메시지 생성
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        chat_room_id: chatRoomID,
        sender_id: user.id,
        content: content.trim(),
        timestamp: new Date().toISOString(),
        read: false,
      })
      .select('id')
      .single();

    if (messageError) {
      throw new Error(messageError.message);
    }

    // 채팅방 lastMessage 업데이트
    const { error: updateError } = await supabase
      .from('chat_rooms')
      .update({
        last_message: content.trim(),
        last_message_time: new Date().toISOString(),
      })
      .eq('id', chatRoomID);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({
      success: true,
      messageID: message.id,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
