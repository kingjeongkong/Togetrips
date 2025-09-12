import { getLocationFromCoordinates } from '@/lib/mapbox';
import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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

  const { lat, lng } = await request.json();

  // lat, lng 유효성 검사
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return NextResponse.json({ error: 'Invalid lat or lng values' }, { status: 400 });
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'Invalid coordinate range' }, { status: 400 });
  }

  try {
    // Mapbox API를 사용하여 위치 정보 가져오기
    const locationData = await getLocationFromCoordinates(lat, lng);

    // 현재 사용자 데이터 가져오기
    const { data: currentUserData, error: fetchError } = await supabase
      .from('users')
      .select(
        'location_city, location_state, location_country, location_lat, location_lng, location_id',
      )
      .eq('id', user.id)
      .single();

    if (fetchError || !currentUserData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 변경사항 확인
    const updateObj: Record<string, string | number> = {};
    let hasChanges = false;

    // 좌표 변경 확인
    if (currentUserData.location_lat !== lat) {
      updateObj.location_lat = lat;
      hasChanges = true;
    }
    if (currentUserData.location_lng !== lng) {
      updateObj.location_lng = lng;
      hasChanges = true;
    }

    // 위치 정보 변경 확인 (Mapbox location_id 기준)
    if (currentUserData.location_id !== locationData.id) {
      updateObj.location_id = locationData.id;
      updateObj.location_city = locationData.city;
      updateObj.location_state = locationData.state;
      updateObj.location_country = locationData.country;
      hasChanges = true;
    }

    if (!hasChanges) {
      return NextResponse.json({
        message: 'No changes detected. Location is already up to date.',
        noChanges: true,
        location: {
          id: locationData.id,
          city: locationData.city,
          state: locationData.state,
          country: locationData.country,
        },
      });
    }

    const { error: updateError } = await supabase.from('users').update(updateObj).eq('id', user.id);

    if (updateError) {
      console.error('Error updating user location:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Location updated successfully',
      location: {
        id: locationData.id,
        city: locationData.city,
        state: locationData.state,
        country: locationData.country,
      },
    });
  } catch (error) {
    console.error('Unexpected error in location update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
