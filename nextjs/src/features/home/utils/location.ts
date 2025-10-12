import { userLocationService } from '../services/userLocationService';

export interface Location {
  lat: number;
  lng: number;
}

export interface CityInfo {
  id: string;
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
 * 권한 상태를 먼저 확인하여 불필요한 권한 요청을 방지합니다.
 */
export const fetchAndSyncUserLocation = async (): Promise<{
  currentLocation: Location;
  cityInfo: CityInfo;
}> => {
  return new Promise(async (resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location services are not supported by your browser.'));
      return;
    }

    // 권한 상태를 먼저 확인하여 불필요한 권한 요청 방지
    try {
      if (navigator.permissions) {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });

        if (permissionStatus.state === 'denied') {
          const isPWA =
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true;

          reject(
            new Error(
              `Location permission has been denied. Please enable location access in your browser settings. PWA: ${isPWA}`,
            ),
          );
          return;
        }
      }
    } catch (error) {
      // Permissions API를 지원하지 않는 브라우저의 경우 계속 진행
      console.log('Permissions API not supported, proceeding with location request :', error);
    }

    // 위치 정보 요청 함수
    const getPosition = (options: PositionOptions) => {
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
                id: locationData.id,
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
            // 정확도가 낮아도 시도 - fallback 옵션으로 재시도
            getPosition({
              enableHighAccuracy: false,
              timeout: 5000,
              maximumAge: 600000,
            });
          } else {
            reject(error);
          }
        },
        options,
      );
    };

    // 첫 번째 시도: 고정밀도 위치 요청
    getPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 600000,
    });
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
