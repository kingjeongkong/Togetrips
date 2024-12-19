import { formatHashTags } from '../../../utils/HashTags';

interface TravelCardProps {
  photoURL?: string;
  name?: string;
  bio?: string;
  tags?: string;
}

const TravelerCard = ({ photoURL, name, bio, tags }: TravelCardProps) => {
  return (
    <div className="overflow-hidden flex flex-col h-full px-5 py-4 bg-white rounded-3xl border-2 border-gray-200 shadow-lg hover:shadow-xl md:px-8 md:py-6">
      <div className="flex">
        <img
          src={photoURL || ''}
          className="w-10 h-10 rounded-full mr-2 md:w-12 md:h-12 md:mr-4"
        />
        <div className="flex flex-col justify-center">
          <span className="text-base font-medium text-gray-800 md:text-lg line-clamp-1">
            {name || ''}
          </span>
          <span className="text-sm text-orange-400 md:text-base line-clamp-1">
            {formatHashTags(tags || '')}
          </span>
        </div>
      </div>

      <p className="flex-grow text-sm text-gray-700 line-clamp-4 mt-3 mb-5 md:text-base">{bio}</p>

      <button className="w-full py-2 text-white bg-orange-500 rounded-3xl shadow-sm hover:bg-orange-600 hover:shadow-md">
        Send Request
      </button>
    </div>
  );
};

export default TravelerCard;
