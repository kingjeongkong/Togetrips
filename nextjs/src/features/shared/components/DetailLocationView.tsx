'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import { useUserLocation } from '@/features/home/hooks/useUserLocation';
import { useMapStore } from '@/stores/mapStore';
import { useEffect, useState } from 'react';

interface UserLocationViewProps {
  otherUserLatitude: number;
  otherUserLongitude: number;
  userName?: string;
  otherUserImageUrl?: string;
  currentUserImageUrl?: string;
}

const UserLocationView = ({
  otherUserLatitude,
  otherUserLongitude,
  userName,
  otherUserImageUrl,
  currentUserImageUrl,
}: UserLocationViewProps) => {
  const { isMapLoaded, updateMapCenter, clearOverlays, addProfileOverlay, showMap, hideMap } =
    useMapStore();

  const { currentLocation } = useUserLocation();
  const [hasError, setHasError] = useState(false);

  // 위치 정보가 로드되면 지도 업데이트
  useEffect(() => {
    if (isMapLoaded && currentLocation) {
      try {
        setHasError(false);

        // 기존 오버레이 정리
        clearOverlays();

        updateMapCenter(otherUserLatitude, otherUserLongitude);

        addProfileOverlay(
          currentLocation.lat,
          currentLocation.lng,
          currentUserImageUrl || '/default-traveler.png',
          'You',
          true,
        );

        addProfileOverlay(
          otherUserLatitude,
          otherUserLongitude,
          otherUserImageUrl || '/default-traveler.png',
          userName || 'Traveler',
          false,
        );

        updateMapCenter(otherUserLatitude, otherUserLongitude);
        showMap('user-location-map');
      } catch (error) {
        console.error('Error updating map with user locations:', error);
        setHasError(true);
      }
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      clearOverlays();
      hideMap();
    };
  }, [
    isMapLoaded,
    otherUserLatitude,
    otherUserLongitude,
    currentLocation?.lat,
    currentLocation?.lng,
    otherUserImageUrl,
    currentUserImageUrl,
    userName,
    clearOverlays,
    addProfileOverlay,
    updateMapCenter,
    showMap,
    hideMap,
  ]);

  return (
    <div className="p-6 pt-3">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Location</h3>

      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-red-500 bg-white"></div>
            <span className="text-gray-700">{userName || 'Other traveler'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-purple-500 bg-white"></div>
            <span className="text-gray-700">You</span>
          </div>
        </div>
      </div>

      <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
        {hasError ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <div className="text-4xl mb-2">🗺️</div>
            <div className="text-sm font-medium mb-1">Map Loading Error</div>
            <div className="text-xs text-center">
              Unable to display location map.
              <br />
              Please try refreshing the page.
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default UserLocationView;
