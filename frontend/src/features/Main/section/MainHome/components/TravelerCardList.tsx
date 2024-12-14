import React from 'react';
import TravelerCard from './TravelerCard';

const TravelerCardList = () => {
  return (
    <div
      className="grid grid-cols-2 gap-8 w-full px-10
    md:grid-cols-3"
    >
      <TravelerCard />
      <TravelerCard />
      <TravelerCard />
      <TravelerCard />
      <TravelerCard />
      <TravelerCard />
      <TravelerCard />
      <TravelerCard />
      <TravelerCard />
      <TravelerCard />
    </div>
  );
};

export default TravelerCardList;
