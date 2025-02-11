interface Location {
  lat: number;
  lng: number;
}

interface LocationData {
  currentLocation: Location;
  cityName: string;
  stateName: string;
}

export const getCurrentLocationData = async () => {
  return new Promise<LocationData>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location services are not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const location: Location = { lat: latitude, lng: longitude };

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=en&key=${
            import.meta.env.VITE_GOOGLE_MAPS_API_KEY
          }`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch geocoding data.');
        }

        const data = await response.json();

        const cityResult = data.results.find((result: any) =>
          result.types.includes('locality')
        );
        const stateResult = data.results.find((result: any) =>
          result.types.includes('administrative_area_level_1')
        );

        const cityName = cityResult
          ? cityResult.address_components[0].long_name
          : 'Unknown';
        const stateName = stateResult
          ? stateResult.address_components[0].long_name
          : 'Unknown';

          console.log(data);
          console.log('City Name:', cityName);
          console.log('State Name:', stateName);

        resolve({ currentLocation: location, cityName, stateName });
      } catch (error) {
        console.error('Error getting location:', error);
        reject(new Error('Failed to retrieve location.'));
      }
    });
  });
};
