export interface Location {
  lat: number;
  lng: number;
}

export interface CityInfo {
  city: string;
  state: string;
}

interface GeocodeResult {
  types: string[];
  address_components: { long_name: string; short_name: string; types: string[] }[];
}

const handleLocation = async (
  position: GeolocationPosition,
  resolve: (value: any) => void,
  reject: (reason?: any) => void,
) => {
  const { latitude, longitude } = position.coords;
  const currentLocation = { lat: latitude, lng: longitude };

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=en&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch geocoding data.');
    }

    const data = await response.json();
    const cityResult = data.results.find((result: GeocodeResult) =>
      result.types.includes('locality'),
    );
    const stateResult = data.results.find((result: GeocodeResult) =>
      result.types.includes('administrative_area_level_1'),
    );

    const city = cityResult ? cityResult.address_components[0].long_name : 'Unknown';
    const state = stateResult ? stateResult.address_components[0].long_name : 'Unknown';

    resolve({ currentLocation, cityInfo: { city, state } });
  } catch (error) {
    reject(error);
  }
};

export const getCurrentLocationData = async (): Promise<{
  currentLocation: Location;
  cityInfo: CityInfo;
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location services are not supported by your browser.'));
      return;
    }

    // 1차: 높은 정확도 시도, 실패 시 낮은 정확도로 fallback
    navigator.geolocation.getCurrentPosition(
      (position) => handleLocation(position, resolve, reject),
      (error) => {
        if (error.code === 2 || error.code === 3) {
          navigator.geolocation.getCurrentPosition(
            (position) => handleLocation(position, resolve, reject),
            reject,
            {
              enableHighAccuracy: false,
              timeout: 5000,
              maximumAge: 60000,
            },
          );
        } else {
          reject(error);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );
  });
};

export const getDistanceText = (distance?: number): string | null => {
  if (distance === undefined) return null;
  if (distance < 1) {
    return 'Within 1km';
  } else {
    return `${Math.round(distance)}km away`;
  }
};
