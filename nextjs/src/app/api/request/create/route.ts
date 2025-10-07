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
    const senderID = user.id;

    const { receiverID, message }: { receiverID: string; message: string } = await request.json();

    if (!receiverID) {
      return NextResponse.json({ error: 'Missing receiverID' }, { status: 400 });
    }

    if (senderID === receiverID) {
      return NextResponse.json({ error: 'Cannot send request to yourself' }, { status: 400 });
    }

    if (message && message.length > 500) {
      return NextResponse.json({ error: 'Message is too long' }, { status: 400 });
    }

    // 중복 요청 체크 (양방향)
    const { data: existing } = await supabase
      .from('requests')
      .select('id, status, sender_id, receiver_id')
      .or(
        `and(sender_id.eq.${senderID},receiver_id.eq.${receiverID}),and(sender_id.eq.${receiverID},receiver_id.eq.${senderID})`,
      )
      .in('status', ['pending', 'accepted', 'declined'])
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: `A request already exists` }, { status: 409 });
    }

    // 요청 생성
    const { data, error } = await supabase
      .from('requests')
      .insert({
        sender_id: senderID,
        receiver_id: receiverID,
        message: message || '',
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ message: 'Request sent successfully', requestID: data.id });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
