'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import type { User } from '@/features/shared/types/User';
import { useUserLocation } from '../hooks/useUserLocation';
import TravelerCard from './TravelerCard';

const TravelerCardList = () => {
  const { users, usersLoading } = useUserLocation();
  const userList = users as User[];

  return (
    <div className="grid grid-cols-2 gap-2 w-full px-2 md:grid-cols-3 md:gap-8 md:px-10">
      {usersLoading ? (
        <div className="col-span-2 md:col-span-3 h-[200px] flex items-center justify-center">
          <LoadingIndicator color="#f97361" size={60} />
        </div>
      ) : (
        userList.map((user, index) => (
          <TravelerCard
            key={user.id || index}
            travelerID={user.id}
            imageURL={user.image}
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
