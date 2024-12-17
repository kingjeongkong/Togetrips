import { useEffect, useState } from 'react';
import useAuth from '../../../../../hooks/useAuth';
import { getCurrentLocationData } from '../utils/location';
import { locationService } from '../service/locationService';

export const useUserLocation = () => {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState({
    lat: 0,
    lng: 0
  });
  const [cityInfo, setCityInfo] = useState({ city: '', state: '' });
  const [loading, setLoading] = useState(true);

  const updateLocation = async () => {
    try {
      const { currentLocation, cityName, stateName } =
        await getCurrentLocationData();
      setCurrentLocation(currentLocation);
      setCityInfo({ city: cityName, state: stateName });

      if (user?.uid) {
        await locationService.updateUserLocationDB(
          user?.uid,
          cityName,
          stateName
        );
      }
    } catch (error) {
      console.error('Error updating location:', error);
      throw new Error('Error updating location');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      updateLocation();
    }
  }, [user]);

  return { currentLocation, cityInfo, loading, updateLocation };
};
