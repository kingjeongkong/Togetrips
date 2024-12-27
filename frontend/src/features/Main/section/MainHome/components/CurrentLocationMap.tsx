import { GoogleMap } from '@react-google-maps/api';
import { FaMapMarkerAlt } from 'react-icons/fa';
import LoadingIndicator from '../../../../../components/LoadingIndicator';

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
  loading
}: CurrentLocationMapProps) => {
  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  return (
    <div className="flex flex-col px-6">
      <div className="flex items-center">
        <FaMapMarkerAlt className="text-orange-500 text-base md:text-xl mr-1" />
        <span className="flex-1 text-sm mr-5 md:text-lg">
          Current Location:
          <span className="text-base font-semibold ml-2 md:text-xl">
            {loading ? <LoadingIndicator color="#f97361" size={17} /> : cityName}
          </span>
        </span>

        <button
          onClick={updateLocation}
          className="rounded-2xl border border-gray-500 shadow-sm hover:bg-sky-100 hover:shadow-md bg-white
          text-xs px-2 py-1
          md:text-base md:px-3 md:py-1"
        >
          Set Location
        </button>
      </div>

      <div className="pt-4">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={currentLocation}
          zoom={15}
        />
      </div>

      <p className="pt-3 text-sm md:text-lg text-gray-500">Only same city travelers are available</p>
    </div>
  );
};

export default CurrentLocationMap;
