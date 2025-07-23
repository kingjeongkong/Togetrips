'use client';

import { useEffect, useState } from 'react';
import { HiXMark } from 'react-icons/hi2';
import { type DistanceFilter } from '../types/filterTypes';
import { distanceToSliderValue, sliderValueToDistance } from '../utils/filterUtils';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (type: 'city' | 'radius', filter: DistanceFilter) => void;
  filterType: 'city' | 'radius';
  distanceFilter: DistanceFilter;
  maxDistance?: number;
}

const FilterModal = ({
  isOpen,
  onClose,
  onApply,
  filterType: initialType,
  distanceFilter: initialFilter,
  maxDistance = 50,
}: FilterModalProps) => {
  const [filterType, setFilterType] = useState<'city' | 'radius'>(initialType);
  const [sliderValue, setSliderValue] = useState(0);
  const [tempFilter, setTempFilter] = useState<DistanceFilter>(initialFilter);

  useEffect(() => {
    if (isOpen) {
      setFilterType(initialType);
      setTempFilter(initialFilter);
      const value = distanceToSliderValue(initialFilter.maxDistance, maxDistance);
      setSliderValue(value);
    }
  }, [isOpen, initialType, initialFilter, maxDistance]);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setSliderValue(value);
    const maxDistanceValue = sliderValueToDistance(value, maxDistance);
    setTempFilter({ minDistance: 0, maxDistance: maxDistanceValue });
  };

  const handleApply = () => {
    onApply(filterType, tempFilter);
    onClose();
  };

  const handleReset = () => {
    setFilterType('city');
    setTempFilter({ minDistance: 0, maxDistance: 30 });
    setSliderValue((30 / maxDistance) * 100);
  };

  if (!isOpen) return null;

  const getDistanceRangeText = (filter: DistanceFilter) => {
    if (filterType === 'city') {
      return 'Same City';
    }
    return `Within ${filter.maxDistance}km`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Distance Filter</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            className={`flex-1 py-2 rounded-lg ${filterType === 'city' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setFilterType('city')}
          >
            Same City
          </button>
          <button
            className={`flex-1 py-2 rounded-lg ${filterType === 'radius' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setFilterType('radius')}
          >
            Radius
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Current Setting</p>
          <p className="text-lg font-medium text-gray-800">{getDistanceRangeText(tempFilter)}</p>
        </div>

        {filterType === 'radius' && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">0km</span>
              <span className="text-sm font-medium text-orange-600">
                {tempFilter.maxDistance}km
              </span>
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
        )}

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
