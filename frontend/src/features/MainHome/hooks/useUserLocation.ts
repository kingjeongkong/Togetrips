import { getCurrentLocationData } from '../utils/location';
import { locationService } from '../service/locationService';
import { useAuthStore } from '../../../../../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';

export const useUserLocation = () => {
  const user = useAuthStore((state) => state.user);

  const {
    data,
    isLoading: loading,
    refetch: updateLocation
  } = useQuery({
    queryKey: ['userLocation', user?.uid],
    queryFn: async () => {
      const { currentLocation, cityName, stateName } = await getCurrentLocationData();

      if (user?.uid) {
        await locationService.updateUserLocationDB(user?.uid, cityName, stateName);
      }

      return { currentLocation, cityInfo: { city: cityName, state: stateName } };
    },
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
    // ToDo : 에러 처리
  });

  return {
    currentLocation: data?.currentLocation || { lat: 0, lng: 0 },
    cityInfo: data?.cityInfo || { city: '', state: '' },
    loading,
    updateLocation
  };
};
