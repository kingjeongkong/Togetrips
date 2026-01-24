import { createServerSupabaseClient } from '@/lib/supabase-config';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(nextRequest: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(nextRequest);

    // Supabase 세션 확인
    const {
      data: { session },
    } = await supabase.auth.getSession();

    let user = null;
    if (session?.access_token) {
      const { data } = await supabase.auth.getUser(session.access_token);
      if (data && data.user) {
        user = data.user;
      }
    }
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    const { requestID, action }: { requestID: string; action: 'accept' | 'decline' } =
      await nextRequest.json();

    if (!requestID || !action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Missing or invalid requestID or action' },
        { status: 400 },
      );
    }

    // 요청 조회
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', requestID)
      .single();

    if (requestError || !request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (request.receiver_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (request.status !== 'pending') {
      return NextResponse.json({ error: 'Request is not in pending state' }, { status: 409 });
    }

    if (action === 'accept') {
      // 트랜잭션 함수 호출
      const { data: chatRoomID, error: rpcError } = await supabase.rpc(
        'accept_request_and_create_chat',
        {
          req_id: requestID,
          sender: request.sender_id,
          receiver: request.receiver_id,
        },
      );

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      return NextResponse.json(
        { message: 'Request accepted and chat room created', chatRoomID },
        { status: 200 },
      );
    }

    // 거절 처리: request 상태를 'declined'로 업데이트
    if (action === 'decline') {
      const { error: updateError } = await supabase
        .from('requests')
        .update({ status: 'declined' })
        .eq('id', requestID);

      if (updateError) {
        throw new Error(updateError.message);
      }

      return NextResponse.json({ message: 'Request declined' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
