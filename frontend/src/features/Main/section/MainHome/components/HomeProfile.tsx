import googleLogo from '../../../../../assets/google-logo.png';
import { useEffect, useState } from 'react';
import { useUserProfile } from '../../../hooks/useUserProfile';

const HomeProfile = () => {
  const { profile } = useUserProfile();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [maxLength, setMaxLength] = useState(200);

  useEffect(() => {
    const updateMaxLength = () => {
      if (window.innerWidth > 786) setMaxLength(200);
      else setMaxLength(50);
    };

    updateMaxLength();
    window.addEventListener('resize', updateMaxLength);

    return () => window.removeEventListener('resize', updateMaxLength);
  }, []);

  return (
    <div className="flex justify-between items-center w-full pl-6 pr-16">
      <img
        src={profile?.photoURL}
        className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-sm"
      />

      <div className="flex flex-col justify-center ml-6 flex-grow">
        <h1 className="text-lg font-medium md:text-2xl">{profile?.name}</h1>
        <p className="text-sm md:text-base text-orange-400">{profile?.tags}</p>
        <p className="text-sm md:text-base">
          {showFullDescription
            ? profile?.bio
            : `${profile?.bio.slice(0, maxLength)}`}

          {profile?.bio && profile?.bio.length > maxLength && (
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
