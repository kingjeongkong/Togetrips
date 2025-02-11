import Sidebar from '../../features/shared/components/Sidebar';
import HomeProfile from '../../features/MainHome/components/HomeProfile';
import CurrentLocationMap from '../../features/MainHome/components/CurrentLocationMap';
import TravelerCardList from '../../features/MainHome/components/TravelerCardList';
import { useUserLocation } from '../../features/MainHome/hooks/useUserLocation';
import DataFetchErrorBoundary from '../../components/ErrorBoundary/DataFetchErrorBoundary';

const Home = () => {
  const { currentLocation, cityInfo, loading, updateLocation } = useUserLocation();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col pt-16 md:pt-5 md:pl-60 space-y-10 overflow-y-auto pb-20 md:pb-5">
        <DataFetchErrorBoundary>
          <HomeProfile />
        </DataFetchErrorBoundary>

        <CurrentLocationMap
          currentLocation={currentLocation}
          cityName={cityInfo.city}
          updateLocation={updateLocation}
          loading={loading}
          // ToDo : 해당 로직만 따로 에러 처리
        />

        <DataFetchErrorBoundary>
          <TravelerCardList cityInfo={cityInfo} />
        </DataFetchErrorBoundary>
      </main>
    </div>
  );
};

export default Home;
