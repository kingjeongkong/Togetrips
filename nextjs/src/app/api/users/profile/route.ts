import { fuzzyCoordinate } from '@/app/api/_utils/location';
import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || user.id;

    // 본인 프로필이거나 다른 사용자 프로필 조회 가능
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // location 필드 가공 (타인 프로필일 때만 표시용 좌표 fuzzing)
    const { location_lat, location_lng, location_city, location_state, ...rest } = userData;
    const isOwnProfile = userId === user.id;
    const hasCoords = location_lat != null && location_lng != null;
    const coords =
      !isOwnProfile && hasCoords
        ? fuzzyCoordinate(location_lat, location_lng)
        : { lat: location_lat, lng: location_lng };
    const location = {
      lat: coords.lat,
      lng: coords.lng,
      city: location_city,
      state: location_state,
    };

    return NextResponse.json({ user: { ...rest, location } });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
