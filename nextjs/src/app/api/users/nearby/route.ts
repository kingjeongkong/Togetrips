import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request);

    // Supabase 세션 확인
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const currentUserId = session.user.id;

    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');

    if (!city || !state) {
      return NextResponse.json({ error: 'Missing city or state parameter' }, { status: 400 });
    }

    // 1. 같은 도시의 모든 사용자 가져오기 (본인 제외)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('location_city', city)
      .eq('location_state', state)
      .neq('id', currentUserId);

    if (usersError) {
      throw new Error(usersError.message);
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ users: [] });
    }

    if (users.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // 2. 모든 사용자에 대한 요청 상태 일괄 조회
    const otherUserIds = users.map((user) => user.id);

    // 내가 보낸 요청들 조회
    const { data: sentRequests } = await supabase
      .from('requests')
      .select('receiver_id')
      .eq('sender_id', currentUserId)
      .in('receiver_id', otherUserIds)
      .in('status', ['accepted', 'declined']);

    // 나에게 온 요청들 조회
    const { data: receivedRequests } = await supabase
      .from('requests')
      .select('sender_id')
      .eq('receiver_id', currentUserId)
      .in('sender_id', otherUserIds)
      .in('status', ['accepted', 'declined']);

    // 3. completed 요청이 있는 사용자 ID 수집
    const completedUserIds = new Set();

    sentRequests?.forEach((request) => {
      completedUserIds.add(request.receiver_id);
    });

    receivedRequests?.forEach((request) => {
      completedUserIds.add(request.sender_id);
    });

    // 4. completed 요청이 없는 사용자만 필터링
    const filteredUsers = users.filter((user) => !completedUserIds.has(user.id));

    return NextResponse.json({ users: filteredUsers });
  } catch (error) {
    console.error('Error fetching nearby users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
