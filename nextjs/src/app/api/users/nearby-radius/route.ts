import {
  addDistanceErrorKm,
  calculateDistanceKm,
  getBoundingBox,
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

    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const radius = parseFloat(searchParams.get('radius') || '');

    if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
      return NextResponse.json({ error: 'Missing or invalid lat/lng/radius' }, { status: 400 });
    }

    // 1. 바운딩 박스 계산
    const { minLat, maxLat, minLng, maxLng } = getBoundingBox(lat, lng, radius);

    // 2. 바운딩 박스 + 본인 제외 + 좌표 있는 유저만 쿼리
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .neq('id', currentUserId)
      .gte('location_lat', minLat)
      .lte('location_lat', maxLat)
      .gte('location_lng', minLng)
      .lte('location_lng', maxLng);

    if (usersError) {
      throw new Error(usersError.message);
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // 3. 요청 상태 있는 유저 제외 (accepted, declined, pending)
    const otherUserIds = users.map((u) => u.id);

    const { data: sentRequests } = await supabase
      .from('requests')
      .select('receiver_id')
      .eq('sender_id', currentUserId)
      .in('receiver_id', otherUserIds)
      .in('status', ['accepted', 'declined', 'pending']);

    const { data: receivedRequests } = await supabase
      .from('requests')
      .select('sender_id')
      .eq('receiver_id', currentUserId)
      .in('sender_id', otherUserIds)
      .in('status', ['accepted', 'declined', 'pending']);

    const excludedUserIds = getExcludedUserIds(sentRequests || [], receivedRequests || []);

    // 4. 남은 유저만 거리 계산
    const filteredUsers = users
      .filter((u) => !excludedUserIds.has(u.id) && u.location_lat && u.location_lng)
      .map((u) => {
        const actualDistanceKm = calculateDistanceKm(lat, lng, u.location_lat, u.location_lng);
        const distance = addDistanceErrorKm(actualDistanceKm);
        // location 필드 가공
        const location = {
          lat: u.location_lat,
          lng: u.location_lng,
          city: u.location_city,
          state: u.location_state,
        };
        const { location_lat, location_lng, location_city, location_state, ...rest } = u;
        return { ...rest, location, distance };
      })
      .filter((u) => u.distance <= radius);

    return NextResponse.json({ users: filteredUsers });
  } catch (error) {
    console.error('Error fetching nearby users by radius:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
