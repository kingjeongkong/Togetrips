import React from 'react';
import Sidebar from '../../features/Main/components/Sidebar';
import MainProfile from '../../features/Main/section/MainHome/components/MainProfile';
import CurrentLocationMap from '../../features/Main/section/MainHome/components/CurrentLocationMap';

const Home = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col pt-16 md:pt-5 md:pl-60 space-y-10">
        <MainProfile />
        <CurrentLocationMap />
      </main>
    </div>
  );
};

export default Home;
