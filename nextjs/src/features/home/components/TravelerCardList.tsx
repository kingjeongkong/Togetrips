'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import type { User } from '@/features/shared/types/User';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { fetchNearbyUsers } from '../services/nearbyUserService';
import TravelerCard from './TravelerCard';

interface TravelerCardListProps {
  cityInfo: { city: string; state: string };
}

const TravelerCardList = ({ cityInfo }: TravelerCardListProps) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['nearbyUsers', cityInfo.city, cityInfo.state, userId],
    queryFn: () => {
      if (!userId) return [];
      return fetchNearbyUsers(cityInfo.city, cityInfo.state, userId);
    },
    enabled: !!userId && !!cityInfo.city && !!cityInfo.state,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    throwOnError: true,
  });

  const userList = users as User[];

  return (
    <div className="grid grid-cols-2 gap-2 w-full px-2 md:grid-cols-3 md:gap-8 md:px-10">
      {isLoading ? (
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
