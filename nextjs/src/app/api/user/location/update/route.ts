import { createServerSupabaseClient } from '@/lib/supabase-config';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient(request);

  // Supabase 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { city, state } = await request.json();

  // 현재 사용자 데이터 가져오기
  const { data: currentData, error: fetchError } = await supabase
    .from('users')
    .select('location_city, location_state')
    .eq('id', session.user.id)
    .single();

  if (fetchError || !currentData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const updateObj: Record<string, string | Date> = {};
  if (currentData.location_city !== city) {
    updateObj.location_city = city;
  }
  if (currentData.location_state !== state) {
    updateObj.location_state = state;
  }

  if (Object.keys(updateObj).length === 0) {
    return NextResponse.json({
      message: 'No changes detected. Location is already up to date.',
      noChanges: true,
    });
  }

  updateObj.updated_at = new Date().toISOString();
  const { error: updateError } = await supabase
    .from('users')
    .update(updateObj)
    .eq('id', session.user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Location updated' });
}
