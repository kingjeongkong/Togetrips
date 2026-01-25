import {
  calculateDistanceKm,
  fuzzyCoordinate,
  getExcludedUserIds,
} from '@/app/api/_utils/location';
import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request);

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
    const currentUserId = user.id;
    const { searchParams } = new URL(request.url);

    const locationId = searchParams.get('location_id');
    if (!locationId) {
      return NextResponse.json({ error: 'Missing location_id parameter' }, { status: 400 });
    }

    // 1. 현재 유저의 위치 정보 가져오기
    const { data: currentUserProfile } = await supabase
      .from('users')
      .select('location_lat, location_lng')
      .eq('id', currentUserId)
      .single();

    const currentLat = currentUserProfile?.location_lat;
    const currentLng = currentUserProfile?.location_lng;

    // 2. 같은 도시의 모든 사용자 가져오기 (본인 제외)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .neq('id', currentUserId)
      .eq('location_id', locationId);

    if (usersError) {
      throw new Error(usersError.message);
    }
    if (!users || users.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // 3. 모든 사용자에 대한 요청 상태 일괄 조회
    const otherUserIds = users.map((user) => user.id);

    // 내가 보낸 요청들 조회
    const { data: sentRequests } = await supabase
      .from('requests')
      .select('receiver_id')
      .eq('sender_id', currentUserId)
      .in('receiver_id', otherUserIds)
      .in('status', ['accepted', 'declined', 'pending']);

    // 나에게 온 요청들 조회
    const { data: receivedRequests } = await supabase
      .from('requests')
      .select('sender_id')
      .eq('receiver_id', currentUserId)
      .in('sender_id', otherUserIds)
      .in('status', ['accepted', 'declined', 'pending']);

    // 4. completed 요청이 있는 사용자 ID 수집
    const completedUserIds = getExcludedUserIds(sentRequests || [], receivedRequests || []);

    // 5. completed 요청이 없는 사용자만 필터링하고 거리 정보 추가
    const filteredUsers = users
      .filter((user) => !completedUserIds.has(user.id))
      .map((user) => {
        let distance = undefined;
        if (
          currentLat !== undefined &&
          currentLng !== undefined &&
          user.location_lat !== undefined &&
          user.location_lng !== undefined
        ) {
          distance = calculateDistanceKm(
            currentLat,
            currentLng,
            user.location_lat,
            user.location_lng,
          );
        }
        const fuzzed = fuzzyCoordinate(user.location_lat, user.location_lng);
        const location = {
          lat: fuzzed.lat,
          lng: fuzzed.lng,
          city: user.location_city,
          state: user.location_state,
          country: user.location_country,
          id: user.location_id,
        };
        const rest = { ...user };
        delete rest.location_lat;
        delete rest.location_lng;
        delete rest.location_city;
        delete rest.location_state;
        delete rest.location_country;
        delete rest.location_id;
        return { ...rest, location, distance };
      });

    return NextResponse.json({ users: filteredUsers });
  } catch (error) {
    console.error('Error fetching nearby users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
