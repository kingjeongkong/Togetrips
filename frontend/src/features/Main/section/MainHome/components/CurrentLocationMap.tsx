import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { FaMapMarkerAlt } from 'react-icons/fa';

const CurrentLocationMap = () => {
  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  const center = {
    lat: -33.8688, // Sydney 위도
    lng: 151.2093 // Sydney 경도
  };

  return (
    <div className="flex flex-col  px-6">
      <div className="flex items-center">
        <FaMapMarkerAlt className="text-orange-500 text-xl mr-1" />
        <span className="text-lg mr-5">
          Current Location:
          <span className="text-xl font-semibold ml-2">Sydney</span>
        </span>

        <button
          className="rounded-2xl border border-gray-500 shadow-sm hover:bg-sky-100 hover:shadow-md bg-white
          text-xs px-2 py-1
          md:text-base md:px-3 md:py-1"
        >
          Set Location
        </button>
      </div>

      <div className="pt-4">
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={15}
          />
        </LoadScript>
      </div>

      <p className="pt-3 text-lg text-gray-500">
        Only same city travelers are available
      </p>
    </div>
  );
};

export default CurrentLocationMap;
