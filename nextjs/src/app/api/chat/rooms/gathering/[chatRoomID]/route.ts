import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';
import { calculateUnreadCount } from '../../../_utils/calculateUnreadCount';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatRoomID: string }> },
) {
  try {
    const supabase = createServerSupabaseClient(request);

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

    const { chatRoomID } = await params;
    if (!chatRoomID) {
      return NextResponse.json({ error: 'Gathering ID is required' }, { status: 400 });
    }

    // 특정 Gathering의 채팅방 조회
    const { data: chatRoom, error } = await supabase
      .from('chat_rooms')
      .select(
        `
        id,
        room_name,
        room_image,
        participants,
        created_at
      `,
      )
      .eq('room_type', 'gathering')
      .eq('id', chatRoomID)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Chat room not found for this gathering' },
          { status: 404 },
        );
      }
      throw new Error(error.message);
    }

    // 사용자가 해당 채팅방에 참여하고 있는지 확인
    if (!chatRoom.participants.includes(user.id)) {
      return NextResponse.json(
        { error: 'You are not a participant in this chat room' },
        { status: 403 },
      );
    }

    // 참여자 프로필 정보 조회 (채팅방 UI에서 필요)
    const participantIds = chatRoom.participants;
    const { data: participants } = await supabase
      .from('users')
      .select('id, name, image')
      .in('id', participantIds);

    // 메시지 조회 (최신 메시지부터, 커서 기반 페이징)
    let messagesQuery = supabase
      .from('messages')
      .select('id, chat_room_id, sender_id, content, timestamp, read')
      .eq('chat_room_id', chatRoom.id)
      .order('timestamp', { ascending: false }) // 최신 메시지부터
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

    // unread_count 계산
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

    const chatRoomWithDetails = {
      ...chatRoom,
      messages: messages || [],
      participant_count: chatRoom.participants.length,
      participants_details:
        participants?.map((p) => ({
          id: p.id,
          name: p.name,
          image: p.image || '/default-traveler.png',
        })) || [],
      unread_count: unreadCount || 0,
      paginationInfo: {
        hasMore,
        nextCursor,
      },
    };

    return NextResponse.json({
      success: true,
      chatRoom: chatRoomWithDetails,
    });
  } catch (error) {
    console.error('Error fetching gathering chat room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
