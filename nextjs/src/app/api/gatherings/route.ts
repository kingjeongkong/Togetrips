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

    // FormData 파싱
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const dataString = formData.get('data') as string;

    if (!dataString) {
      return NextResponse.json({ error: 'Missing data field' }, { status: 400 });
    }

    const body: CreateGatheringRequest = JSON.parse(dataString);
    const {
      activity_title,
      description,
      gathering_time,
      location_id,
      city,
      country,
      max_participants,
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

    // 이미지 업로드 처리
    let coverImageUrl = null;
    if (file) {
      try {
        // 파일 유효성 검사
        if (!file.type.startsWith('image/')) {
          return NextResponse.json(
            { error: 'Invalid file type. Only images are allowed.' },
            { status: 400 },
          );
        }

        // 파일 크기 검사 (1MB 제한)
        if (file.size > 1 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'File size too large. Maximum 1MB allowed.' },
            { status: 400 },
          );
        }

        // 고유한 파일명 생성
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `gatherings/${fileName}`;

        // Supabase Storage에 업로드
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
        }

        // 공개 URL 생성
        const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath);

        coverImageUrl = urlData.publicUrl;
      } catch (error) {
        console.error('Image upload error:', error);
        return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
      }
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
        cover_image_url: coverImageUrl,
      })
      .select('*')
      .single();

    if (createError) {
      throw new Error(createError.message);
    }

    return NextResponse.json({
      message: 'Gathering created successfully',
    });
  } catch (error: unknown) {
    console.error('Error creating gathering:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
