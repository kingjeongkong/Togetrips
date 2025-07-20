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
