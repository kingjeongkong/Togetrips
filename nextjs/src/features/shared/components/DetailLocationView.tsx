'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import { useUserLocation } from '@/features/home/hooks/useUserLocation';
import { useMapStore } from '@/stores/mapStore';
import { useEffect } from 'react';

interface UserLocationViewProps {
  otherUserLatitude: number;
  otherUserLongitude: number;
  userName?: string;
}

const UserLocationView = ({
  otherUserLatitude,
  otherUserLongitude,
  userName,
}: UserLocationViewProps) => {
  const { isMapLoaded, updateMapCenter, clearCircles, addLocationCircle, showMap, hideMap } =
    useMapStore();

  const { currentLocation } = useUserLocation();

  // 위치 정보가 로드되면 지도 업데이트
  useEffect(() => {
    if (isMapLoaded && currentLocation) {
      clearCircles();
      updateMapCenter(otherUserLatitude, otherUserLongitude);

      // 내 위치를 보라색 원으로 표시
      addLocationCircle(currentLocation.lat, currentLocation.lng, '#8B5CF6', 0.4, 200);

      // 다른 사용자 위치를 빨간색 원으로 표시
      addLocationCircle(otherUserLatitude, otherUserLongitude, '#EF4444', 0.15, 700);

      updateMapCenter(otherUserLatitude, otherUserLongitude);
      showMap('user-location-map');
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      clearCircles();
      hideMap();
    };
  }, [isMapLoaded, otherUserLatitude, otherUserLongitude, currentLocation]);

  return (
    <div className="p-6 pt-3">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Location</h3>

      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-violet-500 opacity-40"></div>
          <span>내 위치</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500 opacity-15"></div>
          <span>{userName || 'Traveler'}의 위치</span>
        </div>
      </div>

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
