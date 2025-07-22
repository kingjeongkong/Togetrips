import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

const calculateDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
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

const addDistanceErrorKm = (distanceInKm: number): number => {
  let errorInKm: number;

  if (distanceInKm < 1) {
    const errorPercentage = 0.3 + Math.random() * 0.2;
    errorInKm = distanceInKm * errorPercentage * (Math.random() - 0.5) * 2;
  } else if (distanceInKm < 5) {
    errorInKm = (Math.random() - 0.5) * 0.6;
  } else if (distanceInKm < 10) {
    errorInKm = (Math.random() - 0.5) * 1;
  } else {
    errorInKm = (Math.random() - 0.5) * 1.6;
  }

  return Math.max(0.1, distanceInKm + errorInKm);
};

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

    // 1. 모든 사용자(본인 제외, 좌표 있는 유저만)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .neq('id', currentUserId);

    if (usersError) {
      throw new Error(usersError.message);
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // 2. 반경 내 유저 필터링 및 거리 계산 (단위: km)
    const filteredUsers = users
      .filter((user) => user.location_lat && user.location_lng)
      .map((user) => {
        const actualDistanceKm = calculateDistanceKm(
          lat,
          lng,
          user.location_lat,
          user.location_lng,
        );
        const distance = addDistanceErrorKm(actualDistanceKm);
        return { ...user, distance };
      })
      .filter((user) => user.distance <= radius);

    return NextResponse.json({ users: filteredUsers });
  } catch (error) {
    console.error('Error fetching nearby users by radius:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
