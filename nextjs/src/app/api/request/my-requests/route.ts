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

    // 1. pending 상태의 요청들 가져오기
    const { data: requests, error: requestsError } = await supabase
      .from('requests')
      .select('*')
      .eq('receiver_id', currentUserId)
      .eq('status', 'pending');

    if (requestsError) {
      throw new Error(requestsError.message);
    }

    if (!requests || requests.length === 0) {
      return NextResponse.json({ requests: [] });
    }

    // 2. 보낸 사람들의 ID 수집
    const senderIds = requests.map((req) => req.sender_id);

    // 3. 보낸 사람들의 프로필 정보 일괄 조회
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, image, tags, location_city, location_state')
      .in('id', senderIds);

    if (usersError) {
      throw new Error(usersError.message);
    }

    // 4. 프로필 정보를 Map으로 변환 (빠른 조회용)
    const userProfiles = new Map();
    users?.forEach((user) => {
      userProfiles.set(user.id, {
        name: user.name || '',
        image: user.image || '',
        tags: user.tags || '',
        location: { city: user.location_city || '', state: user.location_state || '' },
      });
    });

    // 5. 요청과 프로필 정보 조합
    const result = requests.map((req) => {
      const sender = userProfiles.get(req.sender_id) || {
        name: '',
        image: '',
        tags: '',
        location: { city: '', state: '' },
      };
      return {
        id: req.id,
        senderID: req.sender_id,
        receiverID: req.receiver_id,
        status: req.status,
        message: req.message || '',
        createdAt: req.created_at,
        sender,
      };
    });

    return NextResponse.json({ requests: result });
  } catch (error) {
    console.error('Error fetching my requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
