'use client';

import { useSession } from '@/providers/SessionProvider';
import { useQuery } from '@tanstack/react-query';
import { userLocationService } from '../services/userLocationService';
import { getCurrentPosition } from '../utils/location';

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
      // 1. GPS 좌표 획득
      const currentLocation = await getCurrentPosition();
      const response = await userLocationService.syncCurrentLocation(
        currentLocation.lat,
        currentLocation.lng,
      );
      const locationData = response.location;

      return {
        ...currentLocation,
        id: locationData.id,
        city: locationData.city,
        state: locationData.state,
        country: locationData.country,
      };
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    throwOnError: true,
  });

  // nearbyUsers fetch (sameCityOnly/location_id 기반 or 반경 기반 분기)
  const {
    data: users,
    isLoading: usersLoading,
    refetch: refetchUsers,
    error: usersError,
  } = useQuery({
    queryKey: sameCityOnly
      ? ['nearbyUsers', locationData?.id, userId]
      : ['nearbyUsersByRadius', locationData?.lat, locationData?.lng, userId, radius],
    queryFn: () => {
      if (!userId || !locationData) return undefined;
      if (sameCityOnly) {
        return userLocationService.fetchNearbyUsers(locationData.id);
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
    cityInfo: locationData
      ? {
          id: locationData.id,
          city: locationData.city,
          state: locationData.state,
          country: locationData.country,
        }
      : undefined,
    loading: locationLoading,
    updateLocation: refetchLocation,
    users,
    usersLoading,
    refetchUsers,
    locationError,
    usersError,
  };
};
