import type { Request } from '@/features/shared/types/Request';
import { db } from '@/lib/firebase-config';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

/**
 * 요청 생성 (pending 상태로 추가)
 */
export async function createRequest({
  senderID,
  receiverID,
  message,
}: {
  senderID: string;
  receiverID: string;
  message: string;
}) {
  const docRef = await addDoc(collection(db, 'requests'), {
    senderID,
    receiverID,
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
  userAID: string,
  userBID: string,
  status: string[],
): Promise<Request[]> {
  const requestsRef = collection(db, 'requests');
  const q = query(
    requestsRef,
    where('senderID', 'in', [userAID, userBID]),
    where('receiverID', 'in', [userAID, userBID]),
    where('status', 'in', status),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Request, 'id'>) }))
    .filter(
      (req) =>
        req.senderID &&
        req.receiverID &&
        req.status &&
        ((req.senderID === userAID && req.receiverID === userBID) ||
          (req.senderID === userBID && req.receiverID === userAID)) &&
        status.includes(req.status),
    );
}

/**
 * 특정 유저의 요청 목록 조회 (sender 프로필 포함)
 */
export async function getMyRequests(userID: string) {
  console.log('[getMyRequests] userID:', userID);
  const requestsRef = collection(db, 'requests');
  const q = query(requestsRef, where('receiverID', '==', userID));
  const snap = await getDocs(q);
  console.log('[getMyRequests] docs count:', snap.docs.length);
  const requests = await Promise.all(
    snap.docs.map(async (docSnap) => {
      const data = docSnap.data() as any;
      console.log('[getMyRequests] request doc:', data);
      let sender = null;
      if (data.senderID) {
        const senderRef = doc(db, 'users', data.senderID);
        const senderDoc = await getDoc(senderRef);
        if (senderDoc.exists()) {
          const { name, image, tags, location } = senderDoc.data();
          sender = { name, image, tags, location };
        }
      }
      return { id: docSnap.id, ...data, sender };
    }),
  );
  console.log('[getMyRequests] final requests:', requests);
  return requests.filter((req) => req.status === 'pending');
}

/**
 * 요청 수락 (status: 'accepted'로 변경)
 */
export async function acceptRequest(requestID: string) {
  const requestRef = doc(db, 'requests', requestID);
  await updateDoc(requestRef, { status: 'accepted' });
  return true;
}

/**
 * 요청 거절 (status: 'declined'로 변경)
 */
export async function declineRequest(requestID: string) {
  const requestRef = doc(db, 'requests', requestID);
  await updateDoc(requestRef, { status: 'declined' });
  return true;
}
