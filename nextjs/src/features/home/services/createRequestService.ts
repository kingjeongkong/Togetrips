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
