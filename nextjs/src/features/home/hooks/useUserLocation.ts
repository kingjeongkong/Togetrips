'use client';

import { useSession } from '@/providers/SessionProvider';
import { useQuery } from '@tanstack/react-query';
import { userLocationService } from '../services/userLocationService';
import { getCurrentLocationData } from '../utils/location';

export const useUserLocation = () => {
  const { userId } = useSession();

  // 위치 정보 fetch + DB 업데이트
  const {
    data: locationData,
    isLoading: locationLoading,
    refetch: refetchLocation,
    error: locationError,
  } = useQuery({
    queryKey: ['userLocation', userId],
    queryFn: async () => {
      const { currentLocation, cityInfo } = await getCurrentLocationData();
      await userLocationService.updateUserLocation(cityInfo.city, cityInfo.state);
      return { ...currentLocation, ...cityInfo };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    throwOnError: true,
  });

  // nearbyUsers fetch
  const {
    data: users,
    isLoading: usersLoading,
    refetch: refetchUsers,
    error: usersError,
  } = useQuery({
    queryKey: ['nearbyUsers', locationData?.city, locationData?.state, userId],
    queryFn: () => {
      if (!userId || !locationData?.city || !locationData?.state) return undefined;
      return userLocationService.fetchNearbyUsers(locationData.city, locationData.state);
    },
    enabled: !!userId && !!locationData?.city && !!locationData?.state,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
