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
  const requestsSnapshot = await getDocs(requestsRef);
  const requests = requestsSnapshot.docs.map((doc) => doc.data());

  const filteredUsers = users.filter((user) => {
    // 내가 보낸 요청 또는 상대방이 나에게 보낸 요청 중 accepted/declined 상태가 있는지 확인
    const hasCompletedRequest = requests.some(
      (req) =>
        ((req.senderId === userId && req.receiverId === user.id) ||
          (req.senderId === user.id && req.receiverId === userId)) &&
        (req.status === 'accepted' || req.status === 'declined'),
    );
    return !hasCompletedRequest;
  });

  return NextResponse.json(filteredUsers);
}
