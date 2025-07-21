import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

// 거리 계산 및 포맷팅 함수들
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371e3; // 지구의 반지름 (미터)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const addDistanceError = (distanceInMeters: number): number => {
  let errorInMeters: number;

  if (distanceInMeters < 1000) {
    // 1km 이내: 퍼센트 기반 오차 (30-50%)
    const errorPercentage = 0.3 + Math.random() * 0.2;
    errorInMeters = distanceInMeters * errorPercentage * (Math.random() - 0.5) * 2;
  } else if (distanceInMeters < 5000) {
    // 1-5km: 절댓값 기반 오차 (±300m)
    errorInMeters = (Math.random() - 0.5) * 600;
  } else if (distanceInMeters < 10000) {
    // 5-10km: 절댓값 기반 오차 (±500m)
    errorInMeters = (Math.random() - 0.5) * 1000;
  } else {
    // 10km 이상: 절댓값 기반 오차 (±800m)
    errorInMeters = (Math.random() - 0.5) * 1600;
  }

  return Math.max(100, distanceInMeters + errorInMeters); // 최소 100m 보장
};

export async function GET(request: NextRequest) {
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
    const currentUserId = user.id;

    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');

    if (!city || !state) {
      return NextResponse.json({ error: 'Missing city or state parameter' }, { status: 400 });
    }

    // 1. 현재 사용자의 위치 정보 가져오기
    const { data: currentUser, error: currentUserError } = await supabase
      .from('users')
      .select('location_lat, location_lng')
      .eq('id', currentUserId)
      .single();

    if (currentUserError) {
      console.error('Error fetching current user location:', currentUserError);
      // 위치 정보가 없어도 계속 진행 (거리 정보 없이 반환)
    }

    // 2. 같은 도시의 모든 사용자 가져오기 (본인 제외, 좌표 정보 포함)
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
    const completedUserIds = new Set();

    sentRequests?.forEach((request) => {
      completedUserIds.add(request.receiver_id);
    });

    receivedRequests?.forEach((request) => {
      completedUserIds.add(request.sender_id);
    });

    // 5. completed 요청이 없는 사용자만 필터링하고 거리 정보 추가
    const filteredUsers = users
      .filter((user) => !completedUserIds.has(user.id))
      .map((user) => {
        // 거리 계산 (현재 사용자와 대상 사용자 모두 좌표가 있는 경우에만)
        let distance: number | undefined;

        if (
          currentUser?.location_lat &&
          currentUser?.location_lng &&
          user.location_lat &&
          user.location_lng
        ) {
          const actualDistance = calculateDistance(
            currentUser.location_lat,
            currentUser.location_lng,
            user.location_lat,
            user.location_lng,
          );

          // 프라이버시를 위해 오차 추가
          distance = addDistanceError(actualDistance);
        }

        return {
          ...user,
          distance,
        };
      });

    return NextResponse.json({ users: filteredUsers });
  } catch (error) {
    console.error('Error fetching nearby users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
