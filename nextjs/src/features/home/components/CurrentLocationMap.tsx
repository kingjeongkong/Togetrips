'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useUserLocation } from '../hooks/useUserLocation';

const CurrentLocationMap = () => {
  const { cityInfo, loading, updateLocation } = useUserLocation();
  return (
    <div className="flex flex-col px-6 md:px-10" aria-label="Current location map">
      <div className="flex items-center">
        <FaMapMarkerAlt className="text-orange-500 text-base md:text-xl mr-1" />
        <span
          className="flex-1 text-sm mr-5 md:text-lg text-black"
          aria-label="Location information"
        >
          Current Location:
          <span
            className="text-base font-semibold ml-2 md:text-xl text-black"
            aria-label="Current city"
          >
            {loading ? <LoadingIndicator color="#f97361" size={17} /> : cityInfo?.city}
          </span>
        </span>
        <button
          onClick={() => updateLocation()}
          className="rounded-2xl border border-gray-500 shadow-sm hover:bg-sky-100 hover:shadow-md bg-white text-black text-xs px-2 py-1 md:text-base md:px-3 md:py-1"
          aria-label="Set location"
        >
          Set Location
        </button>
      </div>
    </div>
  );
};

export default CurrentLocationMap;
