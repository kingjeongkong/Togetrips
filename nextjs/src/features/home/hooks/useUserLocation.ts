'use client';

import { useSession } from '@/providers/SessionProvider';
import { useQuery } from '@tanstack/react-query';
import { userLocationService } from '../services/userLocationService';
import { fetchAndSyncUserLocation } from '../utils/location';

export const useUserLocation = (options?: { sameCityOnly?: boolean; radius?: number }) => {
  const { userId } = useSession();
  const sameCityOnly = options?.sameCityOnly ?? true;
  const radius = options?.radius ?? 50;

  // 위치 정보 fetch + DB 업데이트 (Mapbox 기반)
  const {
    data: locationData,
    isLoading: locationLoading,
    refetch: refetchLocation,
    error: locationError,
  } = useQuery({
    queryKey: ['userLocation', userId],
    queryFn: async () => {
      const { currentLocation, cityInfo } = await fetchAndSyncUserLocation();
      return { ...currentLocation, ...cityInfo };
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    throwOnError: true,
  });

  // nearbyUsers fetch (sameCityOnly/city, state or 반경 기반 분기)
  const {
    data: users,
    isLoading: usersLoading,
    refetch: refetchUsers,
    error: usersError,
  } = useQuery({
    queryKey: sameCityOnly
      ? ['nearbyUsers', locationData?.city, locationData?.state, userId]
      : ['nearbyUsersByRadius', locationData?.lat, locationData?.lng, userId, radius],
    queryFn: () => {
      if (!userId || !locationData) return undefined;
      if (sameCityOnly) {
        return userLocationService.fetchNearbyUsers(locationData.city, locationData.state);
      } else {
        return userLocationService.fetchNearbyUsersByRadius(
          locationData.lat,
          locationData.lng,
          radius,
        );
      }
    },
    enabled: !!userId && !!locationData,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    throwOnError: true,
  });

  return {
    currentLocation: locationData ? { lat: locationData.lat, lng: locationData.lng } : undefined,
    cityInfo: locationData ? { city: locationData.city, state: locationData.state } : undefined,
    loading: locationLoading,
    updateLocation: refetchLocation,
    users,
    usersLoading,
    refetchUsers,
    locationError,
    usersError,
  };
};
