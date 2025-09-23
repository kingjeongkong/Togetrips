import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
    // leave_gathering RPC 함수 호출
    const { data: result, error } = await supabase.rpc('leave_gathering', {
      p_gathering_id: gatheringId,
      p_user_id: currentUserId,
    });

    if (error) {
      console.error('Error calling leave_gathering RPC:', error);
      return NextResponse.json({ error: 'Failed to leave gathering' }, { status: 500 });
    }

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'No result from leave_gathering' }, { status: 500 });
    }

    const { success, message, gathering_data } = result[0];

    if (!success) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: message,
      gathering: gathering_data,
    });
  } catch (error: unknown) {
    console.error('Error leaving gathering:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
