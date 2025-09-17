import type { CreateGatheringRequest } from '@/features/gatherings/types/gatheringTypes';
import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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

    // 모든 모임 조회 (upcoming 모임만)
    const { data: gatherings, error: gatheringsError } = await supabase
      .from('gatherings')
      .select(
        `
        *,
        host:users!gatherings_host_id_fkey(
          id,
          name,
          image
        )
      `,
      )
      .gte('gathering_time', new Date().toISOString())
      .order('gathering_time', { ascending: true });

    if (gatheringsError) {
      throw new Error(gatheringsError.message);
    }

    if (!gatherings || gatherings.length === 0) {
      return NextResponse.json({
        gatherings: [],
      });
    }

    // 참여자 수와 상태 정보 추가
    const gatheringsWithDetails = gatherings.map((gathering) => {
      const participantCount = gathering.participants?.length || 0;
      const isJoined = gathering.participants?.includes(currentUserId) || false;
      const isHost = gathering.host_id === currentUserId;
      const isFull = participantCount >= gathering.max_participants;

      return {
        ...gathering,
        host: gathering.host
          ? {
              id: gathering.host.id,
              name: gathering.host.name || '',
              image: gathering.host.image || '',
            }
          : null,
        participant_count: participantCount,
        is_joined: isJoined,
        is_host: isHost,
        is_full: isFull,
      };
    });

    return NextResponse.json({
      gatherings: gatheringsWithDetails,
    });
  } catch (error: unknown) {
    console.error('Error fetching gatherings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

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
    const hostId = user.id;

    // 요청 본문 파싱
    const body: CreateGatheringRequest = await request.json();
    const {
      activity_title,
      description,
      gathering_time,
      location_id,
      city,
      country,
      max_participants,
      cover_image_url,
    } = body;

    // 입력 검증
    if (!activity_title || !description || !gathering_time || !location_id || !city || !country) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: activity_title, description, gathering_time, location_id, city, country',
        },
        { status: 400 },
      );
    }

    if (max_participants < 2) {
      return NextResponse.json({ error: 'max_participants must be at least 2' }, { status: 400 });
    }

    // 미래 날짜 검증 (기본적인 검증만)
    const gatheringTime = new Date(gathering_time);
    const now = new Date();

    if (gatheringTime <= now) {
      return NextResponse.json({ error: 'Gathering time must be in the future' }, { status: 400 });
    }

    // 모임 생성
    const { data: gathering, error: createError } = await supabase
      .from('gatherings')
      .insert({
        host_id: hostId,
        activity_title,
        description,
        gathering_time,
        location_id,
        city,
        country,
        max_participants,
        participants: [hostId], // 호스트를 첫 번째 참여자로 추가
        cover_image_url: cover_image_url || null,
      })
      .select('*')
      .single();

    if (createError) {
      throw new Error(createError.message);
    }

    return NextResponse.json({
      gathering,
      message: 'Gathering created successfully',
    });
  } catch (error: unknown) {
    console.error('Error creating gathering:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
