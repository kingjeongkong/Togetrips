import type { Request } from '@/features/shared/types/Request';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function createRequest({
  receiverID,
  message,
}: {
  receiverID: string;
  message: string;
}) {
  const response = await fetch('/api/request/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ receiverID, message }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to send request');
  }

  return response.json();
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
    .filter((req) => {
      if (!req.senderID || !req.receiverID || !req.status) {
        return false;
      }

      const isBetweenUsers =
        (req.senderID === userAID && req.receiverID === userBID) ||
        (req.senderID === userBID && req.receiverID === userAID);

      if (!isBetweenUsers) {
        return false;
      }

      return status.includes(req.status);
    });
}

export async function getMyRequests() {
  const response = await fetch('/api/request/my-requests', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch requests');
  }

  const data = await response.json();
  return data.requests;
}

export async function respondToRequest(requestID: string, action: 'accept' | 'decline') {
  const response = await fetch('/api/request/respond', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requestID, action }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to ${action} request`);
  }

  return response.json();
}
