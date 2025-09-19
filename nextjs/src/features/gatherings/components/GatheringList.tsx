import { HiLocationMarker, HiSearch, HiUserGroup } from 'react-icons/hi';
import { useGathering } from '../hooks/useGathering';
import GatheringCard from './GatheringCard';

export default function GatheringList() {
  const { gatherings, isListLoading } = useGathering();
  // 검색/필터 섹션 컴포넌트
  const SearchAndFilterSection = ({ disabled = false, showCount = false }) => (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
      {/* 검색 입력 필드들 */}
      <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4 sm:items-center">
        {/* 모임 검색 */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <HiSearch className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search gatherings..."
            className="flex-1 px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none transition-all duration-200 placeholder-gray-500 min-w-0 w-full"
            disabled={disabled}
          />
        </div>

        {/* 도시 검색 */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <HiLocationMarker className="w-5 h-5 text-blue-600" />
          </div>
          <input
            type="text"
            placeholder="Search city..."
            className="flex-1 px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm font-medium focus:outline-none transition-all duration-200 min-w-0 w-full"
            disabled={disabled}
          />
        </div>
      </div>

      {/* 카운트 표시 */}
      {showCount && (
        <div className="mt-4 sm:mt-0 sm:ml-4 flex justify-center sm:justify-start">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2 rounded-full">
            <span className="text-sm font-bold text-purple-700">{gatherings.length}</span>
            <span className="text-sm text-gray-600">gatherings</span>
          </div>
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
    </div>
  );

  if (isListLoading) {
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
