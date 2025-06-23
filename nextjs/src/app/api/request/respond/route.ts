import { adminDb } from '@/lib/firebase-admin';
import { authOptions } from '@/lib/next-auth-config';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { requestID, action }: { requestID: string; action: 'accept' | 'decline' } =
      await req.json();

    if (!requestID || !action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Missing or invalid requestID or action' },
        { status: 400 },
      );
    }

    const requestRef = adminDb.collection('requests').doc(requestID);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const requestData = requestDoc.data();
    if (requestData?.receiverID !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (requestData?.status !== 'pending') {
      return NextResponse.json({ error: 'Request is not in pending state' }, { status: 409 });
    }

    if (action === 'accept') {
      const batch = adminDb.batch();

      // 1. 요청 상태 'accepted'로 업데이트
      batch.update(requestRef, { status: 'accepted' });

      // 2. 채팅방 생성
      const chatRoomRef = adminDb.collection('chatRooms').doc();
      batch.set(chatRoomRef, {
        participants: [requestData.senderID, requestData.receiverID],
        createdAt: new Date().toISOString(),
        lastMessage: '',
        lastMessageTime: '',
      });

      await batch.commit();

      return NextResponse.json(
        { message: 'Request accepted and chat room created', chatRoomID: chatRoomRef.id },
        { status: 200 },
      );
    }

    if (action === 'decline') {
      await requestRef.update({ status: 'declined' });
      return NextResponse.json({ message: 'Request declined' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error responding to request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
