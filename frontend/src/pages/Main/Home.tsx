import React from 'react';
import Sidebar from '../../features/Main/components/Sidebar';
import MainProfile from '../../features/Main/section/\bMainHome/components/MainProfile';


const Home = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col pt-16 md:pt-5 md:pl-60">
        <MainProfile />
      </main>
    </div>
  );
};

export default Home;
