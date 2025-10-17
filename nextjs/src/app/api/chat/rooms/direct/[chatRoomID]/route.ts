import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';
import { calculateUnreadCount } from '../../../_utils/calculateUnreadCount';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request);

    const pathname = request.nextUrl.pathname;
    const chatRoomID = pathname.split('/').pop();

    if (!chatRoomID) {
      return NextResponse.json({ error: 'Chat room ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const before = searchParams.get('before');
    const MESSAGE_LIMIT = 20;

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

    const { data: chatRoom, error: chatRoomError } = await supabase
      .from('chat_rooms')
      .select('id, participants, created_at')
      .eq('id', chatRoomID)
      .single();

    if (chatRoomError || !chatRoom) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    if (!chatRoom.participants.includes(user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const otherUserId = chatRoom.participants.find((id: string) => id !== user.id);
    if (!otherUserId) {
      return NextResponse.json({ error: 'Invalid chat room' }, { status: 400 });
    }

    const { data: otherUser, error: userError } = await supabase
      .from('users')
      .select('id, name, image')
      .eq('id', otherUserId)
      .single();

    if (userError || !otherUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 메시지 조회 (최신 메시지부터, 커서 기반 페이징)
    let messagesQuery = supabase
      .from('messages')
      .select('id, sender_id, content, timestamp')
      .eq('chat_room_id', chatRoomID)
      .order('timestamp', { ascending: false })
      .limit(MESSAGE_LIMIT);

    // before 파라미터가 있으면 해당 시점 이전의 메시지만 조회
    if (before) {
      messagesQuery = messagesQuery.lt('timestamp', before);
    }

    const { data: messages, error: messagesError } = await messagesQuery;

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // unreadCount 계산
    const unreadCount = await calculateUnreadCount(
      supabase,
      user.id,
      chatRoomID,
      chatRoom.created_at,
    );

    // 다음 페이지를 위한 커서 계산
    const hasMore = messages && messages.length === MESSAGE_LIMIT;
    const nextCursor =
      hasMore && messages.length > 0 ? messages[messages.length - 1].timestamp : null;

    const result = {
      id: chatRoom.id,
      otherUser: {
        id: otherUser.id,
        name: otherUser.name,
        image: otherUser.image || '/default-traveler.png',
      },
      messages: messages || [],
      unread_count: unreadCount || 0,
      paginationInfo: {
        hasMore,
        nextCursor,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching chat room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    // RPC 함수를 사용하여 트랜잭션으로 채팅방과 메시지 삭제
    const { data: deleteSuccess, error: rpcError } = await supabase.rpc('delete_chat_room', {
      p_chat_room_id: chatRoomID,
      p_user_id: user.id,
    });

    if (rpcError) {
      console.error('Error calling delete_chat_room RPC:', rpcError);
      return NextResponse.json({ error: 'Failed to delete chat room' }, { status: 500 });
    }

    // RPC 반환값이 false이면, 작업이 수행되지 않은 것이므로 실패 처리
    if (!deleteSuccess) {
      return NextResponse.json(
        { error: 'Could not delete chat room. Permission denied.' },
        { status: 403 },
      );
    }

    // deleteSuccess가 true일 때만 성공 응답을 보냅니다.
    return NextResponse.json({
      success: true,
      message: 'Chat room deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting chat room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
