import { useMemo, useState } from 'react';
import { HiUserGroup } from 'react-icons/hi';
import { useGathering } from '../hooks/useGathering';
import { GatheringWithDetails } from '../types/gatheringTypes';
import GatheringCard from './GatheringCard';
import SearchAndFilterSection from './SearchAndFilterSection';

export default function GatheringList() {
  const { gatherings, isListLoading } = useGathering();
  const [searchQuery, setSearchQuery] = useState('');

  // 검색 필터링 함수
  const filterGatherings = (gatherings: GatheringWithDetails[], query: string) => {
    if (!query.trim()) {
      return gatherings;
    }

    const lowercaseQuery = query.toLowerCase();
    return gatherings.filter((gathering) =>
      gathering.activity_title.toLowerCase().includes(lowercaseQuery),
    );
  };

  // useMemo로 필터링된 결과 메모이제이션 (표준 패턴)
  const filteredGatherings = useMemo(() => {
    return filterGatherings(gatherings, searchQuery);
  }, [gatherings, searchQuery]);

  // 로딩 스켈레톤 카드 컴포넌트
  const LoadingSkeletonCard = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>
      <div className="p-5">
        <div className="h-6 bg-gray-200 rounded-xl mb-4"></div>
        <div className="space-y-3 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-gray-200 rounded-full border-3 border-white"
                ></div>
              ))}
            </div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded-full w-20"></div>
        </div>
      </div>
    </div>
  );

  // 빈 상태 컴포넌트
  const EmptyState = () => (
    <div className="text-center py-20">
      <div className="mx-auto w-40 h-40 bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-8 shadow-lg">
        <HiUserGroup className="w-20 h-20 text-purple-600" />
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-4">No gatherings found</h3>
    </div>
  );

  return (
    <div className="space-y-8 w-full">
      <SearchAndFilterSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        disabled={isListLoading}
      />

      {isListLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingSkeletonCard key={index} />
          ))}
        </div>
      ) : filteredGatherings.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="flex justify-center sm:justify-start">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2 rounded-full">
              <span className="text-sm font-bold text-purple-700">{filteredGatherings.length}</span>
              <span className="text-sm text-gray-600">
                {filteredGatherings.length !== gatherings.length ? 'results' : 'gatherings'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGatherings.map((gathering) => (
              <GatheringCard key={gathering.id} gathering={gathering} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
