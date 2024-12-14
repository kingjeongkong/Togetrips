import React from 'react';
import Sidebar from '../../features/Main/components/Sidebar';
import HomeProfile from '../../features/Main/section/MainHome/components/HomeProfile';
import CurrentLocationMap from '../../features/Main/section/MainHome/components/CurrentLocationMap';
import TravelerCardList from '../../features/Main/section/MainHome/components/TravelerCardList';

const Home = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col pt-16 md:pt-5 md:pl-60 space-y-10">
        <HomeProfile />
        <CurrentLocationMap />
        <TravelerCardList />
      </main>
    </div>
  );
};

export default Home;
