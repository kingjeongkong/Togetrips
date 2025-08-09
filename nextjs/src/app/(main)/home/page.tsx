'use client';

import DataFetchErrorBoundary from '@/components/ErrorBoundary/DataFetchErrorBoundary';
import CurrentLocationMap from '@/features/home/components/CurrentLocationMap';
import HomeProfile from '@/features/home/components/HomeProfile';
import TravelerCardList from '@/features/home/components/TravelerCardList';

export default function Home() {
  return (
    <main className="space-y-10 pb-20 md:py-5 overflow-y-auto">
      <DataFetchErrorBoundary>
        <HomeProfile />
      </DataFetchErrorBoundary>
      <DataFetchErrorBoundary>
        <CurrentLocationMap />
      </DataFetchErrorBoundary>
      <DataFetchErrorBoundary>
        <TravelerCardList />
      </DataFetchErrorBoundary>
    </main>
  );
}
