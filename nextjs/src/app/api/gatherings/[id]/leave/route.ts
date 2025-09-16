import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const gatheringId = params.id;

    if (!gatheringId) {
      return NextResponse.json({ error: 'Gathering ID is required' }, { status: 400 });
    }

    // 모임 정보 조회
    const { data: gathering, error: gatheringError } = await supabase
      .from('gatherings')
      .select('*')
      .eq('id', gatheringId)
      .single();

    if (gatheringError || !gathering) {
      return NextResponse.json({ error: 'Gathering not found' }, { status: 404 });
    }

    // 호스트는 탈퇴할 수 없음 (모임을 삭제해야 함)
    if (gathering.host_id === currentUserId) {
      return NextResponse.json(
        { error: 'Host cannot leave the gathering. Please delete the gathering instead.' },
        { status: 403 },
      );
    }

    // 참여자인지 확인
    if (!gathering.participants?.includes(currentUserId)) {
      return NextResponse.json(
        { error: 'You are not participating in this gathering' },
        { status: 409 },
      );
    }

    // 참여자 제거
    const updatedParticipants =
      gathering.participants?.filter((participantId: string) => participantId !== currentUserId) ||
      [];

    const { data: updatedGathering, error: updateError } = await supabase
      .from('gatherings')
      .update({
        participants: updatedParticipants,
      })
      .eq('id', gatheringId)
      .select('*')
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully left the gathering',
      gathering: updatedGathering,
    });
  } catch (error: unknown) {
    console.error('Error leaving gathering:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
