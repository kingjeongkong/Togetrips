export const deleteGathering = async (gatheringId: string): Promise<void> => {
  try {
    const response = await fetch(`/api/gatherings/${gatheringId}`, {
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
    console.error('Error deleting gathering:', error);
    throw error instanceof Error ? error : new Error('Failed to delete gathering');
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
