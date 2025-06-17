import { db } from '@/lib/firebase-config';
import { collection, getDocs, query, where } from 'firebase/firestore';

/**
 * 같은 도시/주에 있는 주변 유저 목록을 가져온다.
 * 본인 제외, accepted/declined 상태의 요청이 있는 유저 제외(양방향)
 */
export async function fetchNearbyUsers(city: string, state: string, userId: string) {
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

  // 2. accepted/declined 상태의 요청이 있는 사용자 제외 (양방향)
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

  return filteredUsers.filter((item) => !item.hasCompletedRequest).map((item) => item.user);
}
