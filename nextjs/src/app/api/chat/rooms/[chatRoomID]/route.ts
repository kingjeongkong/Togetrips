import { authOptions } from '@/lib/next-auth-config';
import { createServerSupabaseClient } from '@/lib/supabase-config';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { chatRoomID: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatRoomID } = params;

    if (!chatRoomID) {
      return NextResponse.json({ error: 'Chat room ID is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // 채팅방 정보 조회
    const { data: chatRoom, error } = await supabase
      .from('chat_rooms')
      .select(
        `
        id,
        participants,
        created_at,
        last_message,
        last_message_time
      `,
      )
      .eq('id', chatRoomID)
      .single();

    if (error || !chatRoom) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    // 참가자 권한 확인
    if (!chatRoom.participants.includes(session.user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      chatRoom,
    });
  } catch (error) {
    console.error('Error fetching chat room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
