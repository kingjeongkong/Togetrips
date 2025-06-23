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

    const { chatRoomID } = await request.json();

    // 입력 검증
    if (!chatRoomID) {
      return NextResponse.json({ error: 'Chat room ID is required' }, { status: 400 });
    }

    // 채팅방 존재 및 참가자 검증
    const chatRoomRef = adminDb.collection('chatRooms').doc(chatRoomID);
    const chatRoomDoc = await chatRoomRef.get();

    if (!chatRoomDoc.exists) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    const chatRoomData = chatRoomDoc.data();
    if (!chatRoomData?.participants?.includes(session.user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // 읽지 않은 메시지 조회 (자신이 보낸 메시지 제외)
    const unreadMessagesQuery = await chatRoomRef
      .collection('messages')
      .where('senderID', '!=', session.user.id)
      .where('read', '==', false)
      .get();

    if (unreadMessagesQuery.empty) {
      return NextResponse.json({ success: true, updatedCount: 0 });
    }

    // 배치로 읽음 처리
    const batch = adminDb.batch();
    unreadMessagesQuery.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      updatedCount: unreadMessagesQuery.docs.length,
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
