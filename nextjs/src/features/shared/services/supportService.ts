import { toast } from 'react-toastify';

interface SupportRequestData {
  supportType: 'bug' | 'feature' | 'general';
  subject: string;
  description: string;
  userEmail?: string;
}

interface SupportResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
}

export async function sendSupportRequest(data: SupportRequestData): Promise<SupportResponse> {
  try {
    const response = await fetch('/api/support', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        supportType: data.supportType,
        subject: data.subject,
        description: data.description,
        userEmail: data.userEmail,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      toast.error('Failed to send support request. Please try again later.');
      console.error('Failed to send support request:', result);
      throw new Error(result.error || 'Failed to send support request');
    }

    return result;
  } catch (error) {
    toast.error('Network error. Please check your connection and try again.');
    console.error('Network error:', error);
    throw error;
  }
}
