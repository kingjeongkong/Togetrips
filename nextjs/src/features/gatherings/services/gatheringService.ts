import { GatheringWithDetails, UpsertGatheringRequest } from '../types/gatheringTypes';

export const getGatherings = async (): Promise<GatheringWithDetails[]> => {
  try {
    const response = await fetch('/api/gatherings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.gatherings || [];
  } catch (error) {
    console.error('Error fetching gatherings:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch gatherings');
  }
};

export const getGatheringById = async (id: string): Promise<GatheringWithDetails> => {
  try {
    const response = await fetch(`/api/gatherings/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.gathering;
  } catch (error) {
    console.error('Error fetching gathering details:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch gathering details');
  }
};

export const upsertGathering = async (
  data: UpsertGatheringRequest,
  file?: File,
  gatheringId?: string,
): Promise<void> => {
  try {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    formData.append('data', JSON.stringify(data));
    if (gatheringId) {
      formData.append('gatheringId', gatheringId);
    }

    const response = await fetch('/api/gatherings', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error creating/updating gathering:', error);
    throw error instanceof Error ? error : new Error('Failed to create/update gathering');
  }
};

export const joinGathering = async (gatheringId: string): Promise<void> => {
  try {
    const response = await fetch(`/api/gatherings/${gatheringId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error joining gathering:', error);
    throw error instanceof Error ? error : new Error('Failed to join gathering');
  }
};

export const leaveGathering = async (gatheringId: string): Promise<void> => {
  try {
    const response = await fetch(`/api/gatherings/${gatheringId}/leave`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error leaving gathering:', error);
    throw error instanceof Error ? error : new Error('Failed to leave gathering');
  }
};
