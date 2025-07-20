import type { Request } from '@/features/shared/types/Request';

export async function createRequest({
  receiverId,
  message,
}: {
  receiverId: string;
  message: string;
}) {
  const response = await fetch('/api/request/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ receiverID: receiverId, message }),
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
  try {
    const statusParam = status.join(',');
    const response = await fetch(
      `/api/requests/between-users?userAId=${userAID}&userBId=${userBID}&status=${statusParam}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch requests');
    }

    const data = await response.json();
    return data.requests as Request[];
  } catch (error) {
    console.error('Error fetching requests:', error);
    return [];
  }
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
