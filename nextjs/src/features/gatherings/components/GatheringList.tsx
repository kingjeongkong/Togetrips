import { HiLocationMarker, HiSearch, HiUserGroup } from 'react-icons/hi';
import { GatheringWithDetails } from '../types/gatheringTypes';
import GatheringCard from './GatheringCard';

interface GatheringListProps {
  gatherings: GatheringWithDetails[];
  isLoading?: boolean;
}

export default function GatheringList({ gatherings, isLoading = false }: GatheringListProps) {
  // 검색/필터 섹션 컴포넌트
  const SearchAndFilterSection = ({ disabled = false, showCount = false }) => (
    <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex flex-wrap gap-4 w-full lg:w-auto">
        <div className="flex items-center space-x-3 flex-1 min-w-0 lg:min-w-[400px]">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <HiSearch className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search gatherings..."
            className="flex-1 px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none transition-all duration-200 placeholder-gray-500"
            disabled={disabled}
          />
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <HiLocationMarker className="w-5 h-5 text-blue-600" />
          </div>
          <input
            type="text"
            placeholder="Search city..."
            className="px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm font-medium focus:outline-none transition-all duration-200"
            disabled={disabled}
          />
        </div>
      </div>
      {showCount && (
        <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2 rounded-full">
          <span className="text-sm font-bold text-purple-700">{gatherings.length}</span>
          <span className="text-sm text-gray-600">gatherings</span>
        </div>
      )}
    </div>
  );

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
      <p className="text-gray-600 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
        No gatherings found in your area. Be the first to create one and connect with fellow
        travelers!
      </p>
      <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
        <HiUserGroup className="w-6 h-6 mr-3" />
        Create First Gathering
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-8 w-full">
        <SearchAndFilterSection disabled={true} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingSkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (gatherings.length === 0) {
    return (
      <div className="space-y-8 w-full">
        <SearchAndFilterSection />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      <SearchAndFilterSection showCount={true} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {gatherings.map((gathering) => (
          <GatheringCard key={gathering.id} gathering={gathering} />
        ))}
      </div>
    </div>
  );
}
