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

/**
 * 브라우저에서 GPS 좌표를 얻는 순수 함수
 * 권한 상태를 먼저 확인하여 불필요한 권한 요청을 방지합니다.
 */
export const getCurrentPosition = async (): Promise<Location> => {
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

    // 권한 문제가 없으면 바로 위치 요청 실행
    const requestPosition = (options: PositionOptions, retryCount = 0) => {
      const maxRetries = 3;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ lat: latitude, lng: longitude });
        },
        (error) => {
          if ((error.code === 2 || error.code === 3) && retryCount < maxRetries) {
            // 정확도가 낮아도 시도 - fallback 옵션으로 재시도
            requestPosition(
              {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 600000,
              },
              retryCount + 1,
            );
          } else {
            reject(error);
          }
        },
        options,
      );
    };

    // 첫 번째 시도: 고정밀도 위치 요청
    requestPosition({
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
