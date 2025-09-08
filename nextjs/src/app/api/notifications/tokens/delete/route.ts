import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG] FCM 토큰 삭제 API 호출됨');

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

    console.log('🔍 [DEBUG] 사용자 ID:', user?.id || 'null');

    if (!user?.id) {
      console.error('❌ [DEBUG] 인증되지 않은 사용자');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await request.json();
    console.log('🔍 [DEBUG] 삭제할 토큰:', token ? `${token.substring(0, 20)}...` : 'null');

    if (!token) {
      console.error('❌ [DEBUG] 토큰이 제공되지 않음');
      return NextResponse.json({ error: 'FCM token is required' }, { status: 400 });
    }

    // 삭제 전 토큰 존재 여부 확인
    const { data: existingToken, error: checkError } = await supabase
      .from('fcm_tokens')
      .select('id, token')
      .eq('user_id', user.id)
      .eq('token', token)
      .maybeSingle();

    console.log('🔍 [DEBUG] 삭제 전 토큰 존재 여부:', existingToken ? '존재함' : '존재하지 않음');
    if (existingToken) {
      console.log('🔍 [DEBUG] 기존 토큰 ID:', existingToken.id);
    }

    // 사용자의 FCM 토큰 삭제
    console.log('🔍 [DEBUG] 데이터베이스에서 토큰 삭제 중...');
    const { error, count } = await supabase
      .from('fcm_tokens')
      .delete({ count: 'exact' })
      .eq('user_id', user.id)
      .eq('token', token);

    console.log('🔍 [DEBUG] 삭제된 행 수:', count);

    if (error) {
      console.error('❌ [DEBUG] 데이터베이스 삭제 오류:', error);
      throw new Error(error.message);
    }

    console.log('✅ [DEBUG] FCM 토큰 삭제 성공');

    return NextResponse.json({
      success: true,
      message: 'FCM token deleted successfully',
      deletedCount: count,
    });
  } catch (error) {
    console.error('❌ [DEBUG] FCM 토큰 삭제 API 오류:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
