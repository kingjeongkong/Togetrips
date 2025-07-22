'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import type { User } from '@/features/shared/types/User';
import { useSession } from '@/providers/SessionProvider';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { FaMapMarkedAlt } from 'react-icons/fa';
import { HiFilter } from 'react-icons/hi';
import { useFilter } from '../hooks/useFilter';
import { useUserLocation } from '../hooks/useUserLocation';
import type { DistanceFilter } from '../types/filterTypes';
import { filterUsersByDistance } from '../utils/filterUtils';
import FilterModal from './FilterModal';
import TravelerCard from './TravelerCard';

const TravelerCardList = () => {
  const { users, usersLoading, cityInfo } = useUserLocation();
  const { distanceFilter, applyDistanceFilter } = useFilter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { userId } = useSession();

  const handleRequestSent = (travelerID: string) => {
    if (!users || !cityInfo || !userId) return;

    queryClient.setQueryData(
      ['nearbyUsers', cityInfo?.city, cityInfo?.state, userId],
      (old: User[] | undefined) => (old ? old.filter((u) => u.id !== travelerID) : []),
    );
  };

  // 사용자 목록을 거리 필터에 따라 필터링
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return filterUsersByDistance(users as User[], distanceFilter);
  }, [users, distanceFilter]);

  // 최대 거리 계산 (필터링된 사용자 중 가장 먼 거리 + 여유분)
  const maxDistanceInUsers = useMemo(() => {
    if (!users || users.length === 0) return 50;

    const maxDistance = Math.max(
      ...(users as User[]).map((user) => user.distance || 0).filter((distance) => distance > 0),
    );

    return Math.max((maxDistance / 1000) * 1.2, 50);
  }, [users]);

  const handleApplyFilter = (newFilter: DistanceFilter) => {
    applyDistanceFilter(newFilter);
    setIsModalOpen(false);
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
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-2 md:col-span-3 h-[200px] flex flex-col items-center justify-center text-center">
            <FaMapMarkedAlt className="w-16 h-16 text-gray-300" />
            <p className="text-lg font-medium text-gray-600 mb-1">No travelers found</p>
          </div>
        ) : (
          filteredUsers.map((user, index) => (
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
        onApply={handleApplyFilter}
        currentFilter={distanceFilter}
        maxDistance={maxDistanceInUsers}
      />
    </div>
  );
};

export default TravelerCardList;
