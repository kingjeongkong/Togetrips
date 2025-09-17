import { GatheringWithDetails } from '../types/gatheringTypes';

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
