import { adminDb } from '@/lib/firebase-admin';
import { authOptions } from '@/lib/next-auth-config';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const currentUserId = session.user.id;

    // 1. pending 상태의 요청들 가져오기
    const requestsRef = adminDb.collection('requests');
    const requestsQuery = await requestsRef
      .where('receiverID', '==', currentUserId)
      .where('status', '==', 'pending')
      .get();

    if (requestsQuery.empty) {
      return NextResponse.json({ requests: [] });
    }

    // 2. 보낸 사람들의 ID 수집
    const senderIds = requestsQuery.docs.map((doc) => doc.data().senderID);

    // 3. 보낸 사람들의 프로필 정보 일괄 조회
    const usersRef = adminDb.collection('users');
    const userDocs = await Promise.all(senderIds.map((id) => usersRef.doc(id).get()));

    // 4. 프로필 정보를 Map으로 변환 (빠른 조회용)
    const userProfiles = new Map();
    userDocs.forEach((doc, index) => {
      if (doc.exists) {
        const data = doc.data();
        userProfiles.set(senderIds[index], {
          name: data?.name || '',
          image: data?.image || '',
          tags: data?.tags || '',
          location: data?.location || { city: '', state: '' },
        });
      }
    });

    // 5. 요청과 프로필 정보 조합
    const requests = requestsQuery.docs.map((doc) => {
      const data = doc.data();
      const sender = userProfiles.get(data.senderID) || {
        name: '',
        image: '',
        tags: '',
        location: { city: '', state: '' },
      };

      return {
        id: doc.id,
        senderID: data.senderID,
        receiverID: data.receiverID,
        status: data.status,
        message: data.message || '',
        createdAt: data.createdAt,
        sender,
      };
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching my requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
