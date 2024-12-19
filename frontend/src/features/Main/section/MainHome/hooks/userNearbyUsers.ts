import { useEffect, useState } from 'react';
import { locationService } from '../service/locationService';
import { UserProfile } from '../../../types/profileTypes';
import { useAuthStore } from '../../../../../store/useAuthStore';

export const useNearbyUsers = (cityInfo: { city: string; state: string }) => {
  const user = useAuthStore((state) => state.user);
  const [nearbyUsers, setNearbyUsers] = useState<UserProfile[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNearbyUsers = async () => {
      if (cityInfo.city && cityInfo.state && user?.uid) {
        const users = await locationService.findUsersInSameCity(
          cityInfo.city,
          cityInfo.state
        );
        setNearbyUsers(users.filter((u) => u.uid !== user.uid));
        setIsLoading(false);
      }
    };

    fetchNearbyUsers();
  }, [cityInfo.city, cityInfo.state, user?.uid]);

  return { nearbyUsers, isLoading };
};
