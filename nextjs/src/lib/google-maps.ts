declare global {
  interface Window {
    google: typeof google;
  }
}

let isScriptLoading = false;
let scriptLoadPromise: Promise<void> | null = null;

export const isGoogleMapsLoaded = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    !!window.google &&
    !!window.google.maps &&
    !!window.google.maps.MapTypeId &&
    !!window.google.maps.Map
  );
};

// Google Maps API가 필요한 페이지인지 확인하는 함수
export const shouldLoadGoogleMaps = (): boolean => {
  // 이미 로드된 경우
  if (isGoogleMapsLoaded()) {
    return false;
  }

  // SSR 환경에서는 로드하지 않음
  if (typeof window === 'undefined') return false;

  const pathname = window.location.pathname;

  // 지도 기능을 사용하는 페이지들
  const mapPages = ['/home', '/request'];

  return mapPages.some((page) => pathname.startsWith(page));
};

export const loadGoogleMapsScript = (): Promise<void> => {
  // 이미 로드된 경우
  if (isGoogleMapsLoaded()) {
    return Promise.resolve();
  }

  // 이미 로딩 중인 경우 기존 Promise 반환
  if (isScriptLoading && scriptLoadPromise) {
    return scriptLoadPromise;
  }

  // 스크립트가 이미 DOM에 있는지 확인
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existingScript) {
    return new Promise((resolve) => {
      // 기존 스크립트가 로드될 때까지 대기
      const checkLoaded = () => {
        if (isGoogleMapsLoaded()) {
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
    });
  }

  // 새로운 스크립트 로드
  isScriptLoading = true;
  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isScriptLoading = false;
      resolve();
    };
    script.onerror = () => {
      isScriptLoading = false;
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });

  return scriptLoadPromise;
};

// 조건부로 Google Maps API를 로드하는 함수
export const loadGoogleMapsIfNeeded = (): Promise<void> => {
  if (shouldLoadGoogleMaps()) {
    return loadGoogleMapsScript();
  }
  return Promise.resolve();
};
