import { ConflictError, HttpError } from '@/error/customErrors';

export async function createRequest({
  receiverId,
  message,
}: {
  receiverId: string;
  message: string;
}) {
  try {
    const response = await fetch('/api/request/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ receiverID: receiverId, message }),
    });

    if (!response.ok) {
      const errorData = await response.json();

      if (response.status === 409) {
        throw new ConflictError(errorData.error);
      }

      throw new HttpError(errorData.error || 'Failed to send request', response.status, errorData);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error sending request:', error);
      throw error;
    }
    throw new Error('Failed to send request');
  }
}
