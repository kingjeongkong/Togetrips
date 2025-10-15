import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // 모임 상세 정보 조회
    const { data: gathering, error: gatheringError } = await supabase
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
      .eq('id', gatheringId)
      .single();

    if (gatheringError || !gathering) {
      return NextResponse.json({ error: 'Gathering not found' }, { status: 404 });
    }

    // 참여자 상세 정보 조회
    const { data: participants, error: participantsError } = await supabase
      .from('users')
      .select('id, name, image')
      .in('id', gathering.participants || []);

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
    }

    // 채팅방 정보 별도 조회 (사용자가 참여한 경우에만)
    let chatRoomId = null;
    if (gathering.participants?.includes(currentUserId)) {
      const { data: chatRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('gathering_id', gatheringId)
        .eq('room_type', 'gathering')
        .single();

      chatRoomId = chatRoom?.id || null;
    }

    // 참여자 수와 상태 정보 추가
    const participantCount = gathering.participants?.length || 0;
    const isJoined = gathering.participants?.includes(currentUserId) || false;
    const isHost = gathering.host_id === currentUserId;
    const isFull = participantCount >= gathering.max_participants;

    const gatheringWithDetails = {
      ...gathering,
      host: gathering.host
        ? {
            id: gathering.host.id,
            name: gathering.host.name || '',
            image: gathering.host.image || '',
          }
        : null,
      participants: gathering.participants || [],
      participant_details:
        participants?.map((participant) => ({
          id: participant.id,
          name: participant.name || '',
          image: participant.image || '',
        })) || [],
      participant_count: participantCount,
      is_joined: isJoined,
      is_host: isHost,
      is_full: isFull,
      chat_room_id: chatRoomId,
    };

    return NextResponse.json({
      gathering: gatheringWithDetails,
    });
  } catch (error: unknown) {
    console.error('Error fetching gathering details:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = createServerSupabaseClient(request);

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

    const { data: result, error } = await supabase.rpc('delete_gathering', {
      p_gathering_id: gatheringId,
      p_user_id: currentUserId,
    });

    if (error || !result?.success) {
      return NextResponse.json(
        { error: result?.message || 'Failed to delete gathering' },
        { status: 500 },
      );
    }

    // Storage에서 이미지 삭제
    const coverImageUrl = result.cover_image_url;
    if (coverImageUrl) {
      try {
        // URL에서 파일 경로 추출
        const urlParts = coverImageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `gatherings/${fileName}`;

        const { error: storageError } = await supabase.storage
          .from('gatherings-images')
          .remove([filePath]);

        if (storageError) {
          console.error('Failed to delete image from storage:', storageError);
          // Storage 삭제 실패해도 gathering은 이미 삭제되었으므로 계속 진행
        } else {
          console.log('Image deleted from storage:', filePath);
        }
      } catch (storageError) {
        console.error('Error processing image deletion:', storageError);
      }
    }

    return NextResponse.json({
      success: true,
      message: result?.message,
    });
  } catch (error: unknown) {
    console.error('Error deleting gathering:', error);
    return NextResponse.json({ error: `Internal server error: ${error}` }, { status: 500 });
  }
}
