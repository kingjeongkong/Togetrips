import { db } from '@/lib/firebase-config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const userId = searchParams.get('userId');
  if (!city || !state || !userId) return NextResponse.json([], { status: 400 });

  // 1. 같은 도시의 모든 사용자 가져오기 (본인 제외)
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    where('location.city', '==', city),
    where('location.state', '==', state),
  );
  const querySnapshot = await getDocs(q);
  const users = querySnapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((user) => user.id !== userId);

  // 2. accepted/declined 상태의 요청이 있는 사용자 제외
  const requestsRef = collection(db, 'requests');
  const filteredUsers = await Promise.all(
    users.map(async (user) => {
      // 내가 보낸 요청
      const sentQuery = query(
        requestsRef,
        where('senderID', '==', userId),
        where('receiverID', '==', user.id),
        where('status', 'in', ['accepted', 'declined']),
      );
      // 상대가 나에게 보낸 요청
      const receivedQuery = query(
        requestsRef,
        where('senderID', '==', user.id),
        where('receiverID', '==', userId),
        where('status', 'in', ['accepted', 'declined']),
      );

      const [sentSnap, receivedSnap] = await Promise.all([
        getDocs(sentQuery),
        getDocs(receivedQuery),
      ]);
      const hasCompletedRequest = !sentSnap.empty || !receivedSnap.empty;

      return { user, hasCompletedRequest };
    }),
  );

  const result = filteredUsers.filter((item) => !item.hasCompletedRequest).map((item) => item.user);

  return NextResponse.json(result);
}
