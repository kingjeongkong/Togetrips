'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import { useMapStore } from '@/stores/mapStore';
import { useEffect } from 'react';

interface UserLocationViewProps {
  latitude: number;
  longitude: number;
  userName?: string;
}

const UserLocationView = ({ latitude, longitude, userName }: UserLocationViewProps) => {
  const { isMapLoaded, updateMapCenter, clearCircles, addLocationCircle, showMap, hideMap } =
    useMapStore();

  // 위치 정보가 로드되면 지도 업데이트
  useEffect(() => {
    if (isMapLoaded) {
      clearCircles();
      updateMapCenter(latitude, longitude);
      addLocationCircle(latitude, longitude);
      showMap('user-location-map');
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      clearCircles();
      hideMap();
    };
  }, [
    isMapLoaded,
    latitude,
    longitude,
    clearCircles,
    updateMapCenter,
    addLocationCircle,
    showMap,
    hideMap,
  ]);

  return (
    <div className="p-6 pt-3">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Location</h3>
      <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
        <div
          id="user-location-map"
          className="w-full h-full"
          style={{ display: isMapLoaded ? 'block' : 'none' }}
        />
        {!isMapLoaded && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <LoadingIndicator color="#f97361" size={32} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLocationView;
