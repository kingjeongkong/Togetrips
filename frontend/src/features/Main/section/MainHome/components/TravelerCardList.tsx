import { UserProfile } from '../../../types/profileTypes';
import TravelerCard from './TravelerCard';

interface TravelerCardListProps {
  nearbyUsers: UserProfile[] | null;
}

const TravelerCardList = ({ nearbyUsers }: TravelerCardListProps) => {
  return (
    <div
      className="grid grid-cols-2 gap-8 w-full px-10
    md:grid-cols-3"
    >
      {nearbyUsers?.map((user, index) => (
        <TravelerCard
          key={index}
          photoURL={user.photoURL}
          name={user.name}
          bio={user.bio}
          tags={user.tags}
        />
      ))}
    </div>
  );
};

export default TravelerCardList;
