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

    const { chatRoomID, content } = await request.json();

    // 입력 검증
    if (!chatRoomID || !content) {
      return NextResponse.json({ error: 'Chat room ID and content are required' }, { status: 400 });
    }

    // 메시지 내용 검증
    if (typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 });
    }

    // XSS 방지를 위한 기본적인 검증
    const dangerousPatterns = /<script|javascript:|on\w+\s*=|data:text\/html/i;
    if (dangerousPatterns.test(content)) {
      return NextResponse.json({ error: 'Invalid message content' }, { status: 400 });
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

    // 새 메시지 생성
    const newMessage = {
      senderID: session.user.id,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    // 메시지 추가 및 채팅방 업데이트 (배치 처리)
    const batch = adminDb.batch();

    // 메시지 추가
    const messageRef = chatRoomRef.collection('messages').doc();
    batch.set(messageRef, newMessage);

    // 채팅방 lastMessage 업데이트
    batch.update(chatRoomRef, {
      lastMessage: content.trim(),
      lastMessageTime: new Date().toISOString(),
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      messageID: messageRef.id,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
