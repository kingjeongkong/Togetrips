export const userLocationService = {
  async syncCurrentLocation(lat: number, lng: number) {
    const res = await fetch('/api/user/location/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng }),
    });
    if (!res.ok) throw new Error('Failed to update location');
    return res.json();
  },

  async fetchNearbyUsers(locationId: string) {
    const response = await fetch(
      `/api/users/nearby?location_id=${encodeURIComponent(locationId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch nearby users');
    }

    const data = await response.json();
    return data.users;
  },

  async fetchNearbyUsersByRadius(lat: number, lng: number, radius: number) {
    const response = await fetch(
      `/api/users/nearby-radius?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=${encodeURIComponent(radius)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch nearby users by radius');
    }
    const data = await response.json();
    return data.users;
  },
};
