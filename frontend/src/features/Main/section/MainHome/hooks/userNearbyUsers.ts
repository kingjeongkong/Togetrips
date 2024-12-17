import { useEffect, useState } from 'react';
import useAuth from '../../../../../hooks/useAuth';
import { locationService } from '../service/locationService';
import { UserProfile } from '../../../types/profileTypes';

export const useNearbyUsers = (cityInfo: { city: string; state: string }) => {
  const { user } = useAuth();
  const [nearbyUsers, setNearbyUsers] = useState<UserProfile[] | null>(null);

  useEffect(() => {
    const fetchNearbyUsers = async () => {
      if (cityInfo.city && cityInfo.state && user?.uid) {
        const users = await locationService.findUsersInSameCity(
          cityInfo.city,
          cityInfo.state
        );
        setNearbyUsers(users.filter((u) => u.uid !== user.uid))
      }
    };

    fetchNearbyUsers();
  }, [cityInfo.city, cityInfo.state, user?.uid]);

  return nearbyUsers
};
