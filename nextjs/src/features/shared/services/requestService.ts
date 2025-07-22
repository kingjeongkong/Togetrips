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
