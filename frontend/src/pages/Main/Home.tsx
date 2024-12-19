import Sidebar from '../../features/Main/components/Sidebar';
import HomeProfile from '../../features/Main/section/MainHome/components/HomeProfile';
import CurrentLocationMap from '../../features/Main/section/MainHome/components/CurrentLocationMap';
import TravelerCardList from '../../features/Main/section/MainHome/components/TravelerCardList';
import { useUserLocation } from '../../features/Main/section/MainHome/hooks/useUserLocation';
import { useNearbyUsers } from '../../features/Main/section/MainHome/hooks/userNearbyUsers';

const Home = () => {
  const { currentLocation, cityInfo, loading, updateLocation } = useUserLocation();
  const { nearbyUsers, isLoading } = useNearbyUsers(cityInfo);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col pt-16 md:pt-5 md:pl-60 space-y-10 overflow-y-auto pb-20 md:pb-5">
        <HomeProfile />
        <CurrentLocationMap
          currentLocation={currentLocation}
          cityName={cityInfo.city}
          updateLocation={updateLocation}
          loading={loading}
        />
        <TravelerCardList nearbyUsers={nearbyUsers} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default Home;
