'use client';

import { useEffect, useState } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface CityInfo {
  city: string;
  state: string;
}

export const useUserLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<Location>({
    lat: 37.5665,
    lng: 126.978,
  });
  const [cityInfo, setCityInfo] = useState<CityInfo>({
    city: 'Seoul',
    state: 'Seoul',
  });
  const [loading, setLoading] = useState(false);

  const updateLocation = async () => {
    setLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      setCurrentLocation({ lat: latitude, lng: longitude });

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=en&key=${
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        }`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch geocoding data.');
      }

      const data = await response.json();

      const cityResult = data.results.find((result: any) => result.types.includes('locality'));
      const stateResult = data.results.find((result: any) =>
        result.types.includes('administrative_area_level_1'),
      );

      const cityName = cityResult ? cityResult.address_components[0].long_name : 'Unknown';
      const stateName = stateResult ? stateResult.address_components[0].long_name : 'Unknown';

      setCityInfo({ city: cityName, state: stateName });
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateLocation();
  }, []);

  return { currentLocation, cityInfo, loading, updateLocation };
};
