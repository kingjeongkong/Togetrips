'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import TravelerCard from '@/features/home/components/TravelerCard';
import { useNearbyUsers } from '@/features/home/hooks/useNearbyUsers';

interface TravelerCardListProps {
  cityInfo: { city: string; state: string };
}

const TravelerCardList = ({ cityInfo }: TravelerCardListProps) => {
  const { users, isLoading } = useNearbyUsers(cityInfo);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <LoadingIndicator color="#6366f1" size={40} />
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="text-center text-gray-500 py-8">No travelers found in {cityInfo.city}</div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-6">
      {users.map((user) => (
        <TravelerCard key={user.id} user={user} />
      ))}
    </div>
  );
};

export default TravelerCardList;
