import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

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

    const result = {
      id: chatRoom.id,
      otherUser: {
        id: otherUser.id,
        name: otherUser.name,
        image: otherUser.image || '/default-traveler.png',
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching chat room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
