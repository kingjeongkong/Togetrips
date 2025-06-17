import type { Request } from '@/features/shared/types/Request';
import { db } from '@/lib/firebase-config';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';

/**
 * 요청 생성 (pending 상태로 추가)
 */
export async function createRequest({
  senderId,
  receiverId,
  message,
}: {
  senderId: string;
  receiverId: string;
  message: string;
}) {
  const docRef = await addDoc(collection(db, 'requests'), {
    senderId,
    receiverId,
    message,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

/**
 * 두 유저 간의 특정 상태의 요청 목록 조회 (양방향)
 */
export async function fetchRequestsBetweenUsers(
  userAId: string,
  userBId: string,
  status: string[],
): Promise<Request[]> {
  const requestsRef = collection(db, 'requests');
  const q = query(
    requestsRef,
    where('senderId', 'in', [userAId, userBId]),
    where('receiverId', 'in', [userAId, userBId]),
    where('status', 'in', status),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Request, 'id'>) }))
    .filter(
      (req) =>
        req.senderId &&
        req.receiverId &&
        req.status &&
        ((req.senderId === userAId && req.receiverId === userBId) ||
          (req.senderId === userBId && req.receiverId === userAId)) &&
        status.includes(req.status),
    );
}
