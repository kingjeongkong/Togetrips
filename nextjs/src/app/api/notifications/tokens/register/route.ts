import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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

    const { token, device_type = 'web' } = await request.json();

    // 입력 검증
    if (!token) {
      return NextResponse.json({ error: 'FCM token is required' }, { status: 400 });
    }

    if (!['web', 'android', 'ios'].includes(device_type)) {
      return NextResponse.json({ error: 'Invalid device type' }, { status: 400 });
    }

    // 기존 토큰이 있는지 확인
    const { data: existingToken, error: checkError } = await supabase
      .from('fcm_tokens')
      .select('id')
      .eq('user_id', user.id)
      .eq('token', token)
      .maybeSingle();

    if (checkError) {
      throw new Error(checkError.message);
    }

    // 이미 존재하는 토큰이면 업데이트, 없으면 새로 생성
    let result;
    if (existingToken) {
      // 기존 토큰 업데이트
      const { data, error } = await supabase
        .from('fcm_tokens')
        .update({
          device_type,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingToken.id)
        .select('id, token, device_type, created_at, updated_at')
        .single();

      if (error) {
        throw new Error(error.message);
      }
      result = data;
    } else {
      // 새 토큰 생성
      const { data, error } = await supabase
        .from('fcm_tokens')
        .insert({
          user_id: user.id,
          token,
          device_type,
        })
        .select('id, token, device_type, created_at, updated_at')
        .single();

      if (error) {
        throw new Error(error.message);
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      message: 'FCM token registered successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
