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

    // 모임 정보 조회
    const { data: gathering, error: gatheringError } = await supabase
      .from('gatherings')
      .select('*')
      .eq('id', gatheringId)
      .single();

    if (gatheringError || !gathering) {
      return NextResponse.json({ error: 'Gathering not found' }, { status: 404 });
    }

    // 이미 참여자인지 확인
    if (gathering.participants?.includes(currentUserId)) {
      return NextResponse.json(
        { error: 'You are already participating in this gathering' },
        { status: 409 },
      );
    }

    // GPS 기반 위치 검증 (사용자의 현재 위치와 모임 위치 비교)
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('location_id')
      .eq('id', currentUserId)
      .single();

    if (userError || !userProfile) {
      return NextResponse.json({ error: 'User location not found' }, { status: 404 });
    }

    // 사용자가 모임이 열리는 도시에 있는지 확인
    if (userProfile.location_id !== gathering.location_id) {
      return NextResponse.json(
        { error: 'You must be in the same city as the gathering to join' },
        { status: 403 },
      );
    }

    // 원자적 업데이트: 참여자 추가와 동시에 정원 확인
    const { data: updatedGathering, error: updateError } = await supabase
      .from('gatherings')
      .update({
        participants: [...(gathering.participants || []), currentUserId],
      })
      .eq('id', gatheringId)
      .eq('max_participants', gathering.max_participants)
      .select('*')
      .single();

    // 업데이트 후 정원 초과 확인
    if (
      updatedGathering &&
      updatedGathering.participants.length > updatedGathering.max_participants
    ) {
      // 정원 초과 시 롤백
      await supabase
        .from('gatherings')
        .update({
          participants: gathering.participants || [],
        })
        .eq('id', gatheringId);

      return NextResponse.json({ error: 'This gathering is full' }, { status: 409 });
    }

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the gathering',
      gathering: updatedGathering,
    });
  } catch (error: unknown) {
    console.error('Error joining gathering:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
