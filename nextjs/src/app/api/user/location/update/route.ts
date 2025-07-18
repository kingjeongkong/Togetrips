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

  const { city, state, lat, lng } = await request.json();

  // 현재 사용자 데이터 가져오기
  const { data: currentData, error: fetchError } = await supabase
    .from('users')
    .select('location_city, location_state, location_lat, location_lng')
    .eq('id', user.id)
    .single();

  if (fetchError || !currentData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const updateObj: Record<string, string | number | Date> = {};

  // city, state 변경 확인
  if (currentData.location_city !== city) {
    updateObj.location_city = city;
  }
  if (currentData.location_state !== state) {
    updateObj.location_state = state;
  }

  // 좌표 변경 확인 (lat, lng이 제공된 경우에만)
  if (lat !== undefined && lng !== undefined) {
    if (currentData.location_lat !== lat) {
      updateObj.location_lat = lat;
    }
    if (currentData.location_lng !== lng) {
      updateObj.location_lng = lng;
    }
  }

  if (Object.keys(updateObj).length === 0) {
    return NextResponse.json({
      message: 'No changes detected. Location is already up to date.',
      noChanges: true,
    });
  }

  updateObj.updated_at = new Date().toISOString();
  const { error: updateError } = await supabase.from('users').update(updateObj).eq('id', user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Location updated' });
}
