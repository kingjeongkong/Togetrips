import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// POST 요청만 받도록 설정
export async function POST(request: Request) {
  // 보안을 위해 간단한 시크릿 키를 헤더에서 확인합니다.
  // 실제 운영 시에는 더 안전한 방법을 사용해야 합니다.
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 서비스 키를 사용해 관리자 권한의 Supabase 클라이언트를 생성합니다.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    console.log('🧹 Starting cleanup of expired gatherings...');

    // 1. 만료된 Gathering의 ID를 모두 조회합니다.
    const { data: expiredGatherings, error: fetchError } = await supabaseAdmin
      .from('gatherings')
      .select('id, activity_title, gathering_time')
      .lt('gathering_time', new Date().toISOString());

    if (fetchError) throw fetchError;

    if (!expiredGatherings || expiredGatherings.length === 0) {
      console.log('✅ No expired gatherings to clean up.');
      return NextResponse.json({
        success: true,
        message: 'No expired gatherings to clean up.',
        cleanedGatherings: 0,
        cleanedChatRooms: 0,
      });
    }

    console.log(`📋 Found ${expiredGatherings.length} expired gatherings to clean up.`);
    const gatheringIds = expiredGatherings.map((g) => g.id);

    // 2. 만료된 Gathering과 연결된 채팅방 ID들을 조회합니다.
    const { data: chatRooms, error: chatRoomsError } = await supabaseAdmin
      .from('chat_rooms')
      .select('id, room_name, gathering_id')
      .in('gathering_id', gatheringIds)
      .eq('room_type', 'gathering');

    if (chatRoomsError) throw chatRoomsError;

    if (!chatRooms || chatRooms.length === 0) {
      console.log('✅ No chat rooms to clean up for the expired gatherings.');
      return NextResponse.json({
        success: true,
        message: 'No chat rooms to clean up for the expired gatherings.',
        cleanedGatherings: expiredGatherings.length,
        cleanedChatRooms: 0,
      });
    }

    console.log(`💬 Found ${chatRooms.length} chat rooms to clean up.`);
    const chatRoomIds = chatRooms.map((cr) => cr.id);

    // 3. 해당 채팅방의 메시지들을 모두 삭제합니다.
    console.log('🗑️ Deleting messages from expired gathering chat rooms...');
    const { error: messagesError } = await supabaseAdmin
      .from('messages')
      .delete()
      .in('chat_room_id', chatRoomIds);

    if (messagesError) throw messagesError;
    console.log('✅ Messages deleted successfully.');

    // 4. 채팅방들을 삭제합니다.
    console.log('🗑️ Deleting expired gathering chat rooms...');
    const { error: roomDeleteError } = await supabaseAdmin
      .from('chat_rooms')
      .delete()
      .in('id', chatRoomIds);

    if (roomDeleteError) throw roomDeleteError;
    console.log('✅ Chat rooms deleted successfully.');

    return NextResponse.json({
      success: true,
      message: `Cleanup successful. Deleted ${chatRooms.length} chat rooms and their messages.`,
      cleanedGatherings: expiredGatherings.length,
      cleanedChatRooms: chatRooms.length,
      details: {
        expiredGatherings: expiredGatherings.map((g) => ({
          id: g.id,
          title: g.activity_title,
          gatheringTime: g.gathering_time,
        })),
        deletedChatRooms: chatRooms.map((cr) => ({
          id: cr.id,
          name: cr.room_name,
          gatheringId: cr.gathering_id,
        })),
      },
    });
  } catch (error: unknown) {
    console.error('❌ Error during cleanup:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
