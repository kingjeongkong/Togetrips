import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // 이미 참여자인지 확인
    if (gathering.participants?.includes(currentUserId)) {
      return NextResponse.json(
        { error: 'You are already participating in this gathering' },
        { status: 409 },
      );
    }

    // 모임이 만원인지 확인
    const currentParticipantCount = gathering.participants?.length || 0;
    if (currentParticipantCount >= gathering.max_participants) {
      return NextResponse.json({ error: 'This gathering is full' }, { status: 409 });
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

    // 참여자 추가
    const updatedParticipants = [...(gathering.participants || []), currentUserId];

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
      message: 'Successfully joined the gathering',
      gathering: updatedGathering,
    });
  } catch (error: unknown) {
    console.error('Error joining gathering:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
