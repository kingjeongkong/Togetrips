'use client';

import DataFetchErrorBoundary from '@/components/ErrorBoundary/DataFetchErrorBoundary';
import CurrentLocationMap from '@/features/home/components/CurrentLocationMap';
import HomeProfile from '@/features/home/components/HomeProfile';
import TravelerCardList from '@/features/home/components/TravelerCardList';

export default function Home() {
  return (
    <main className="space-y-10 overflow-y-auto pb-20 md:pb-5">
      <DataFetchErrorBoundary>
        <HomeProfile />
      </DataFetchErrorBoundary>
      <CurrentLocationMap />
      <DataFetchErrorBoundary>
        <TravelerCardList />
      </DataFetchErrorBoundary>
    </main>
  );
}
