export const userLocationService = {
  async updateUserLocation(city: string, state: string) {
    const res = await fetch('/api/location/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, state }),
    });
    if (!res.ok) throw new Error('Failed to update location');
    return res.json();
  },

  async fetchNearbyUsers(city: string, state: string) {
    const response = await fetch(
      `/api/users/nearby?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`,
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
};
