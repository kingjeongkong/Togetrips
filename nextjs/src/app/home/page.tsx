'use client';

import DataFetchErrorBoundary from '@/components/ErrorBoundary/DataFetchErrorBoundary';
import CurrentLocationMap from '@/features/home/components/CurrentLocationMap';
import HomeProfile from '@/features/home/components/HomeProfile';
import TravelerCardList from '@/features/home/components/TravelerCardList';
import { useUserLocation } from '@/features/home/hooks/useUserLocation';
import Sidebar from '@/features/shared/components/Sidebar';

export default function Home() {
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
        />

        <DataFetchErrorBoundary>
          <TravelerCardList cityInfo={cityInfo} />
        </DataFetchErrorBoundary>
      </main>
    </div>
  );
}
