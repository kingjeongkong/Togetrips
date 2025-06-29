'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { FaMapMarkerAlt } from 'react-icons/fa';

interface CurrentLocationMapProps {
  currentLocation: { lat: number; lng: number };
  cityName: string;
  updateLocation: () => void;
  loading: boolean;
}

const CurrentLocationMap = ({
  currentLocation,
  cityName,
  updateLocation,
  loading,
}: CurrentLocationMapProps) => {
  return (
    <div className="flex flex-col px-6">
      <div className="flex items-center">
        <FaMapMarkerAlt className="text-orange-500 text-base md:text-xl mr-1" />
        <span className="flex-1 text-sm mr-5 md:text-lg text-black">
          Current Location:
          <span className="text-base font-semibold ml-2 md:text-xl text-black">
            {loading ? <LoadingIndicator color="#f97361" size={17} /> : cityName}
          </span>
        </span>

        <button
          onClick={updateLocation}
          className="rounded-2xl border border-gray-500 shadow-sm hover:bg-sky-100 hover:shadow-md bg-white text-black
          text-xs px-2 py-1
          md:text-base md:px-3 md:py-1"
        >
          Set Location
        </button>
      </div>

      <div className="pt-4">
        <div className="w-full h-[300px] md:h-[400px]">
          <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={currentLocation}
              zoom={15}
            />
          </LoadScript>
        </div>
      </div>

      <p className="pt-3 text-sm md:text-lg text-gray-500">
        Only same city travelers are available
      </p>
    </div>
  );
};

export default CurrentLocationMap;
