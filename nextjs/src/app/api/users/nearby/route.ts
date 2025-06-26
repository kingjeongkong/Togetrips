import { adminDb } from '@/lib/firebase-admin';
import { authOptions } from '@/lib/next-auth-config';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const currentUserId = session.user.id;

    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');

    if (!city || !state) {
      return NextResponse.json({ error: 'Missing city or state parameter' }, { status: 400 });
    }

    // 1. 같은 도시의 모든 사용자 가져오기 (본인 제외)
    const usersRef = adminDb.collection('users');
    const usersQuery = await usersRef
      .where('location.city', '==', city)
      .where('location.state', '==', state)
      .get();

    const users = usersQuery.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((user) => user.id !== currentUserId);

    if (users.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // 2. 모든 사용자에 대한 요청 상태 일괄 조회
    const requestsRef = adminDb.collection('requests');
    const otherUserIds = users.map((user) => user.id);

    // 내가 보낸 요청들 조회
    const sentRequestsQuery = await requestsRef
      .where('senderID', '==', currentUserId)
      .where('receiverID', 'in', otherUserIds)
      .where('status', 'in', ['accepted', 'declined'])
      .get();

    // 나에게 온 요청들 조회
    const receivedRequestsQuery = await requestsRef
      .where('senderID', 'in', otherUserIds)
      .where('receiverID', '==', currentUserId)
      .where('status', 'in', ['accepted', 'declined'])
      .get();

    // 3. completed 요청이 있는 사용자 ID 수집
    const completedUserIds = new Set();

    sentRequestsQuery.docs.forEach((doc) => {
      const data = doc.data();
      completedUserIds.add(data.receiverID);
    });

    receivedRequestsQuery.docs.forEach((doc) => {
      const data = doc.data();
      completedUserIds.add(data.senderID);
    });

    // 4. completed 요청이 없는 사용자만 필터링
    const filteredUsers = users.filter((user) => !completedUserIds.has(user.id));

    return NextResponse.json({ users: filteredUsers });
  } catch (error) {
    console.error('Error fetching nearby users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
