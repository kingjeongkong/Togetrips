import { createServerSupabaseClient } from '@/lib/supabase-config';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(nextRequest: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(nextRequest);

    // Supabase 세션 확인
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

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

    if (action === 'decline') {
      const { error: declineError } = await supabase
        .from('requests')
        .update({ status: 'declined' })
        .eq('id', requestID);
      if (declineError) {
        throw new Error(declineError.message);
      }
      return NextResponse.json({ message: 'Request declined' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error responding to request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
