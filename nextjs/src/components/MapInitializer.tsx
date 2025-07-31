'use client';

import { loadGoogleMapsIfNeeded, shouldLoadGoogleMaps } from '@/lib/google-maps';
import { useMapStore } from '@/stores/mapStore';
import { useEffect, useState } from 'react';

export const MapInitializer = () => {
  const { initializeMap } = useMapStore();
  const [shouldInitialize, setShouldInitialize] = useState(false);

  useEffect(() => {
    if (shouldLoadGoogleMaps()) {
      setShouldInitialize(true);
    }
  }, []);

  useEffect(() => {
    if (shouldInitialize) {
      // Google Maps API 로드 후 지도 초기화
      loadGoogleMapsIfNeeded()
        .then(() => {
          initializeMap();
        })
        .catch((error) => {
          console.error('Failed to load Google Maps:', error);
        });
    }
  }, [shouldInitialize, initializeMap]);

  // Google Maps가 필요하지 않은 페이지에서는 아무것도 렌더링하지 않음
  if (!shouldInitialize) {
    return null;
  }

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
};
