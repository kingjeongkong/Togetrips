import LoadingIndicator from '../../../../../components/LoadingIndicator';
import { useNearbyUsers } from '../hooks/userNearbyUsers';
import TravelerCard from './TravelerCard';

interface TravelerCardListProps {
  cityInfo: { city: string; state: string };
}

const TravelerCardList = ({ cityInfo }: TravelerCardListProps) => {
  const { nearbyUsers, isLoading } = useNearbyUsers(cityInfo);

  return (
    <div className="grid grid-cols-2 gap-2 w-full px-2 md:grid-cols-3 md:gap-8 md:px-10">
      {isLoading ? (
        <div className="col-span-2 md:col-span-3 h-[200px] flex items-center justify-center">
          <LoadingIndicator color="#f97361" size={60} />
        </div>
      ) : (
        nearbyUsers?.map((user, index) => (
          <TravelerCard
            key={index}
            travelerID={user.uid}
            photoURL={user.photoURL}
            name={user.name}
            bio={user.bio}
            tags={user.tags}
          />
        ))
      )}
    </div>
  );
};

export default TravelerCardList;
