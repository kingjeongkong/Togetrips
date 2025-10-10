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

        // 파일 크기 검사 (2MB 제한)
        if (file.size > 2 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'File size too large. Maximum 2MB allowed.' },
            { status: 400 },
          );
        }

        // 고유한 파일명 생성
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `gatherings/${fileName}`;

        // Supabase Storage에 업로드
        const { error: uploadError } = await supabase.storage
          .from('gatherings-images')
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
        }

        // 공개 URL 생성
        const { data: urlData } = supabase.storage.from('gatherings-images').getPublicUrl(filePath);

        coverImageUrl = urlData.publicUrl;
      } catch (error) {
        console.error('Image upload error:', error);
        return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
      }
    }

    // 모임과 그룹 채팅방을 함께 생성 (트랜잭션 처리)
    const { data: result, error: createError } = await supabase.rpc(
      'create_gathering_with_chat_room',
      {
        p_host_id: hostId,
        p_activity_title: activity_title,
        p_description: description,
        p_gathering_time: gathering_time,
        p_location_id: location_id,
        p_city: city,
        p_country: country,
        p_max_participants: max_participants,
        p_cover_image_url: coverImageUrl,
      },
    );

    if (createError) {
      console.error('RPC error:', createError);
      throw new Error(createError.message);
    }

    if (!result || result.length === 0) {
      throw new Error('No result from create_gathering_with_chat_room');
    }

    const { success, message, gathering_data, chat_room_data } = result[0];

    if (!success) {
      throw new Error(message);
    }

    return NextResponse.json({
      message: message,
      gathering: gathering_data,
      chatRoom: chat_room_data,
    });
  } catch (error: unknown) {
    console.error('Error creating gathering:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
