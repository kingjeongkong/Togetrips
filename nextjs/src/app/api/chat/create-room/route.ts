import { adminDb } from '@/lib/firebase-admin';
import { authOptions } from '@/lib/next-auth-config';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { participants } = await request.json();

    // 입력 검증
    if (!participants || !Array.isArray(participants) || participants.length !== 2) {
      return NextResponse.json({ error: 'Exactly 2 participants are required' }, { status: 400 });
    }

    // 현재 사용자가 참가자에 포함되어 있는지 검증
    if (!participants.includes(session.user.id)) {
      return NextResponse.json({ error: 'You must be a participant' }, { status: 403 });
    }

    // 기존 채팅방이 있는지 확인 (중복 생성 방지)
    const existingRoomQuery = await adminDb
      .collection('chatRooms')
      .where('participants', 'array-contains', session.user.id)
      .get();

    const existingRoom = existingRoomQuery.docs.find((doc) => {
      const data = doc.data();
      return (
        data.participants.length === 2 &&
        data.participants.includes(participants[0]) &&
        data.participants.includes(participants[1])
      );
    });

    if (existingRoom) {
      return NextResponse.json({
        success: true,
        chatRoomID: existingRoom.id,
        message: 'Chat room already exists',
      });
    }

    // 새 채팅방 생성
    const newChatRoom = {
      participants,
      createdAt: new Date().toISOString(),
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
    };

    const chatRoomRef = await adminDb.collection('chatRooms').add(newChatRoom);

    return NextResponse.json({
      success: true,
      chatRoomID: chatRoomRef.id,
    });
  } catch (error) {
    console.error('Error creating chat room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
