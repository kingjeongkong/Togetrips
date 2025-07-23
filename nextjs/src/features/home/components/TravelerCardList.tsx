'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import type { User } from '@/features/shared/types/User';
import { useSession } from '@/providers/SessionProvider';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { FaMapMarkedAlt } from 'react-icons/fa';
import { HiFilter } from 'react-icons/hi';
import { useUserLocation } from '../hooks/useUserLocation';
import { DEFAULT_DISTANCE_FILTER, type DistanceFilter } from '../types/filterTypes';
import FilterModal from './FilterModal';
import TravelerCard from './TravelerCard';

const TravelerCardList = () => {
  const [filterType, setFilterType] = useState<'city' | 'radius'>('city');
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>(DEFAULT_DISTANCE_FILTER);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { userId } = useSession();

  const { users, usersLoading, currentLocation, cityInfo } = useUserLocation({
    sameCityOnly: filterType === 'city',
    radius: filterType === 'radius' ? distanceFilter.maxDistance : undefined,
  });

  const handleApplyFilter = (type: 'city' | 'radius', distance: DistanceFilter) => {
    setFilterType(type);
    setDistanceFilter(distance);
    setIsModalOpen(false);
  };

  const sortedUsersByDistance = useMemo(() => {
    if (!users) return [];
    return users
      .filter((u: User) => u.distance !== undefined)
      .sort((a: User, b: User) => (a.distance || 0) - (b.distance || 0));
  }, [users]);

  const usersQueryKey =
    filterType === 'city'
      ? ['nearbyUsers', cityInfo?.city, cityInfo?.state, userId]
      : [
          'nearbyUsersByRadius',
          currentLocation?.lat,
          currentLocation?.lng,
          userId,
          distanceFilter.maxDistance,
        ];

  const handleRequestSent = (travelerId: string) => {
    queryClient.setQueryData(usersQueryKey, (old: User[] | undefined) =>
      old ? old.filter((u) => u.id !== travelerId) : [],
    );
  };

  return (
    <div className="space-y-6">
      <div className="px-2 md:px-10">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Nearby Travelers</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            aria-label="Open distance filter"
          >
            <span className="w-5 h-5 text-gray-600 flex items-center">
              <HiFilter className="w-5 h-5" />
            </span>
            <span className="text-sm font-medium text-gray-700">Filter</span>
          </button>
        </div>
      </div>

      <div
        className="grid grid-cols-2 gap-2 w-full px-2 md:grid-cols-3 md:gap-8 md:px-10"
        aria-label="Traveler card list"
      >
        {usersLoading ? (
          <div className="col-span-2 md:col-span-3 h-[200px] flex items-center justify-center">
            <LoadingIndicator color="#f97361" size={60} />
          </div>
        ) : sortedUsersByDistance === 0 ? (
          <div className="col-span-2 md:col-span-3 h-[200px] flex flex-col items-center justify-center text-center">
            <FaMapMarkedAlt className="w-16 h-16 text-gray-300" />
            <p className="text-lg font-medium text-gray-600 mb-1">No travelers found</p>
          </div>
        ) : (
          sortedUsersByDistance.map((user: User, index: number) => (
            <div
              key={user.id || index}
              aria-label={`Traveler card for ${user.name || 'unknown user'}`}
            >
              <TravelerCard
                travelerId={user.id}
                imageURL={user.image}
                name={user.name}
                bio={user.bio}
                tags={user.tags}
                distance={user.distance}
                onRequestSent={handleRequestSent}
              />
            </div>
          ))
        )}
      </div>

      <FilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filterType={filterType}
        distanceFilter={distanceFilter}
        onApply={(type, distance) => handleApplyFilter(type, distance)}
      />
    </div>
  );
};

export default TravelerCardList;
