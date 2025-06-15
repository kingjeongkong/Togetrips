'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import TravelerCard from '@/features/home/components/TravelerCard';
import useNearbyUsers from '@/features/home/hooks/useNearbyUsers';

interface TravelerCardListProps {
  cityInfo: { city: string; state: string };
}

interface User {
  id: string;
  name: string;
  image: string;
  bio: string;
  tags: string;
  location?: {
    city: string;
    state: string;
  };
}

const TravelerCardList = ({ cityInfo }: TravelerCardListProps) => {
  const { users, isLoading } = useNearbyUsers(cityInfo.city, cityInfo.state);

  return (
    <div className="grid grid-cols-2 gap-2 w-full px-2 md:grid-cols-3 md:gap-8 md:px-10">
      {isLoading ? (
        <div className="col-span-2 md:col-span-3 h-[200px] flex items-center justify-center">
          <LoadingIndicator color="#f97361" size={60} />
        </div>
      ) : (
        users?.map((user: User, index: number) => (
          <TravelerCard
            key={user.id || index}
            travelerID={user.id}
            photoURL={user.image}
            name={user.name}
            bio={user.bio}
            tags={user.tags}
          />
        ))
      )}
    </div>
  );
};

export default TravelerCardList;
