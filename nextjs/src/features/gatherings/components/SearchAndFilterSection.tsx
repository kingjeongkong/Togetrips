'use client';

import { HiLocationMarker, HiSearch } from 'react-icons/hi';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  disabled?: boolean;
}

export default function SearchAndFilterSection({
  searchQuery,
  onSearchChange,
  disabled = false,
}: SearchAndFilterProps) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
      <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4 sm:items-center">
        {/* 모임 검색 */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <HiSearch className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search gatherings..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none transition-all duration-200 placeholder-gray-500 min-w-0 w-full"
            disabled={disabled}
          />
        </div>

        {/* 도시 검색 (기능은 추후 구현) */}
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
    </div>
  );
}
