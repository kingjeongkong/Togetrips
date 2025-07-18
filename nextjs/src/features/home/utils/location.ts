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

export const getCurrentLocationData = async (): Promise<{
  currentLocation: Location;
  cityInfo: CityInfo;
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location services are not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
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
    }, reject);
  });
};

/**
 * 거리를 표시할 텍스트로 변환하는 함수
 * @param distance - 미터 단위의 거리
 * @returns 거리 표시 텍스트 또는 null
 */
export const getDistanceText = (distance?: number): string | null => {
  if (distance === undefined) return null;

  if (distance < 1000) {
    return 'Within 1km';
  } else {
    // 거리를 km로 변환하고 정수로 반올림
    const distanceInKm = Math.round(distance / 1000);
    return `${distanceInKm}km away`;
  }
};
