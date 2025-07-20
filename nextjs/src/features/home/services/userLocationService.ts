export const userLocationService = {
  async updateUserLocation(city: string, state: string, lat?: number, lng?: number) {
    const body: any = { city, state };
    if (lat !== undefined && lng !== undefined) {
      body.lat = lat;
      body.lng = lng;
    }

    const res = await fetch('/api/user/location/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
