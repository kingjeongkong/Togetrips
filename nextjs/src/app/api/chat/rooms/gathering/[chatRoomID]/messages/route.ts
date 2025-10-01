import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request);

    const pathname = request.nextUrl.pathname;
    const chatRoomID = pathname.split('/')[5]; // /api/chat/rooms/gathering/[chatRoomID]/messages

    if (!chatRoomID) {
      return NextResponse.json({ error: 'Chat room ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const before = searchParams.get('before');
    const limit = parseInt(searchParams.get('limit') || '20');

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

    // 채팅방 존재 여부 및 참여자 확인
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

    // 메시지 조회 (최신 메시지부터, 커서 기반 페이징)
    let messagesQuery = supabase
      .from('messages')
      .select('id, sender_id, content, timestamp')
      .eq('chat_room_id', chatRoomID)
      .order('timestamp', { ascending: false })
      .limit(limit);

    // before 파라미터가 있으면 해당 시점 이전의 메시지만 조회
    if (before) {
      messagesQuery = messagesQuery.lt('timestamp', before);
    }

    const { data: messages, error: messagesError } = await messagesQuery;

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // 다음 페이지를 위한 커서 계산
    const hasMore = messages && messages.length === limit;
    const nextCursor =
      hasMore && messages.length > 0 ? messages[messages.length - 1].timestamp : null;

    // 오직 페이징 결과만 반환
    return NextResponse.json({
      messages: messages || [],
      hasMore,
      nextCursor,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
