import { userLocationService } from '../services/userLocationService';

export interface Location {
  lat: number;
  lng: number;
}

export interface CityInfo {
  city: string;
  state: string;
  country: string;
}

export interface StandardizedLocation {
  id: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
}

/**
 * 브라우저에서 GPS 좌표를 얻어, 서버 API를 통해
 * 표준화된 현재 위치 정보를 가져오는 함수
 */
export const fetchAndSyncUserLocation = async (): Promise<{
  currentLocation: Location;
  cityInfo: CityInfo;
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location services are not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // userLocationService를 사용하여 위치 정보 업데이트 및 가져오기
          const response = await userLocationService.syncCurrentLocation(latitude, longitude);
          const locationData: StandardizedLocation = response.location;

          resolve({
            currentLocation: { lat: latitude, lng: longitude },
            cityInfo: {
              city: locationData.city,
              state: locationData.state,
              country: locationData.country,
            },
          });
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        if (error.code === 2 || error.code === 3) {
          // 정확도가 낮아도 시도
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords;

                // userLocationService를 사용하여 위치 정보 업데이트 및 가져오기
                const response = await userLocationService.syncCurrentLocation(latitude, longitude);
                const locationData: StandardizedLocation = response.location;

                resolve({
                  currentLocation: { lat: latitude, lng: longitude },
                  cityInfo: {
                    city: locationData.city,
                    state: locationData.state,
                    country: locationData.country,
                  },
                });
              } catch (error) {
                reject(error);
              }
            },
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
