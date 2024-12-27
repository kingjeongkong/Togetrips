import { useEffect, useState } from 'react';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { formatHashTags } from '../../../utils/HashTags';
import LoadingIndicator from '../../../../../components/LoadingIndicator';

const HomeProfile = () => {
  const { profile, isLoading } = useUserProfile();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [maxLength, setMaxLength] = useState(200);
  const shouldShowMoreButton = profile?.bio && profile.bio.length > maxLength;

  useEffect(() => {
    const updateMaxLength = () => {
      if (window.innerWidth > 786) setMaxLength(200);
      else setMaxLength(50);
    };

    updateMaxLength();
    window.addEventListener('resize', updateMaxLength);

    return () => window.removeEventListener('resize', updateMaxLength);
  }, []);

  if (isLoading) {
    return (
      <div className="pl-16 pt-5">
        <LoadingIndicator color="#6366f1" size={40} />
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center w-full pl-6 pr-3 md:pr-16">
      <img
        src={profile?.photoURL}
        className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg"
      />

      <div className="flex flex-col justify-center flex-grow ml-3 md:ml-6">
        <h1 className="text-lg font-medium md:text-2xl">{profile?.name}</h1>
        <p className="text-xs md:text-base text-orange-400">
          {formatHashTags(profile?.tags || '')}
        </p>
        <p className="text-sm md:text-base">
          {showFullDescription
            ? profile?.bio
            : `${profile?.bio.slice(0, maxLength)}`}

          {shouldShowMoreButton && (
            <button
              onClick={() => setShowFullDescription((prev) => !prev)}
              className="ml-2 text-blue-500 hover:underline"
            >
              {showFullDescription ? 'less' : '...more'}
            </button>
          )}
        </p>
      </div>
    </div>
  );
};

export default HomeProfile;
