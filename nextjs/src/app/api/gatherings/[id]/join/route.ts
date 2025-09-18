import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: gatheringId } = await params;
    if (!gatheringId) {
      return NextResponse.json({ error: 'Gathering ID is required' }, { status: 400 });
    }

    // 데이터베이스 함수(RPC) 호출
    const { data, error } = await supabase.rpc('join_gathering', {
      p_gathering_id: gatheringId,
      p_user_id: currentUserId,
    });

    if (error) {
      console.error('RPC error:', error);
      return NextResponse.json(
        { error: 'Failed to join gathering due to a server error.' },
        { status: 500 },
      );
    }

    const result = data[0];

    if (!result.success) {
      // 함수가 반환한 실패 메시지에 따라 상태 코드 분기
      const status =
        result.message.includes('full') || result.message.includes('already participating')
          ? 409
          : 404;
      return NextResponse.json({ error: result.message }, { status });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      gathering: result.gathering_data,
    });
  } catch (error: unknown) {
    console.error('Error in join gathering route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
