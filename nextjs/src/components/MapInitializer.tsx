'use client';

import { useMapStore } from '@/stores/mapStore';
import { useEffect } from 'react';

export const MapInitializer = () => {
  const { initializeMap } = useMapStore();

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
};
