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
      // 좌표 정보도 함께 전송
      await userLocationService.updateUserLocation(
        cityInfo.city,
        cityInfo.state,
        currentLocation.lat,
        currentLocation.lng,
      );
      return { ...currentLocation, ...cityInfo };
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10분으로 증가
    gcTime: 30 * 60 * 1000, // 30분으로 증가
    refetchOnWindowFocus: false, // 윈도우 포커스 시 리페치 비활성화
    refetchOnMount: false, // 마운트 시 리페치 비활성화
    throwOnError: true,
  });

  // nearbyUsers fetch
  // ToDo : 거리별 필터를 적용함 -> 같은 도시 내의 유저를 기반으로 필터링함 -> 분리가 필요할 듯
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
    staleTime: 10 * 60 * 1000, // 10분으로 증가
    gcTime: 30 * 60 * 1000, // 30분으로 증가
    refetchOnWindowFocus: false, // 윈도우 포커스 시 리페치 비활성화
    refetchOnMount: false, // 마운트 시 리페치 비활성화
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
