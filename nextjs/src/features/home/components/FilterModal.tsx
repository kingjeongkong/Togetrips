'use client';

import { useEffect, useState } from 'react';
import { HiXMark } from 'react-icons/hi2';
import { DEFAULT_DISTANCE_FILTER, type DistanceFilter } from '../types/filterTypes';
import { distanceToSliderValue, sliderValueToDistance } from '../utils/filterUtils';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filter: DistanceFilter) => void;
  currentFilter: DistanceFilter;
  maxDistance?: number;
}

const FilterModal = ({
  isOpen,
  onClose,
  onApply,
  currentFilter,
  maxDistance = 50,
}: FilterModalProps) => {
  const [sliderValue, setSliderValue] = useState(0);
  const [tempFilter, setTempFilter] = useState<DistanceFilter>(currentFilter);

  // 모달이 열릴 때 현재 필터로 초기화
  useEffect(() => {
    if (isOpen) {
      setTempFilter(currentFilter);
      const value = distanceToSliderValue(currentFilter.maxDistance, maxDistance);
      setSliderValue(value);
    }
  }, [isOpen, currentFilter, maxDistance]);

  // 슬라이더 값 변경 시 임시 필터 업데이트
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setSliderValue(value);

    const maxDistanceValue = sliderValueToDistance(value, maxDistance);
    setTempFilter({
      minDistance: 0,
      maxDistance: maxDistanceValue,
    });
  };

  // 필터 적용
  const handleApply = () => {
    onApply(tempFilter);
    onClose();
  };

  // 필터 초기화
  const handleReset = () => {
    const defaultFilter = DEFAULT_DISTANCE_FILTER;
    setTempFilter(defaultFilter);
    setSliderValue(distanceToSliderValue(defaultFilter.maxDistance, maxDistance));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Distance Filter</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Current Distance</p>
          <p className="text-lg font-medium text-gray-800">Within {tempFilter.maxDistance}km</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">0km</span>
            <span className="text-sm font-medium text-orange-600">{tempFilter.maxDistance}km</span>
            <span className="text-sm text-gray-600">{maxDistance}km</span>
          </div>

          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-300"
              style={{
                background: `linear-gradient(to right, #f97316 0%, #f97316 ${sliderValue}%, #e5e7eb ${sliderValue}%, #e5e7eb 100%)`,
              }}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-2 px-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2 px-4 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
