'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import { formatHashTags } from '@/features/shared/utils/HashTags';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import useUserProfileById from '../hooks/useProfile';

const HomeProfile = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { profile, isLoading } = useUserProfileById(userId as string);
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

  if (isLoading || !profile) {
    return (
      <div className="pl-16 pt-5">
        <LoadingIndicator color="#6366f1" size={40} />
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center w-full pl-6 pr-3 md:pr-16">
      <Image
        src={profile?.image || '/default-traveler.png'}
        width={80}
        height={80}
        className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg"
        alt="Profile"
      />
      <div className="flex flex-col justify-center flex-grow ml-3 md:ml-6">
        <h1 className="text-lg font-semibold md:text-2xl text-black">{profile?.name}</h1>
        <p className="text-xs md:text-base text-orange-400">
          {formatHashTags(profile?.tags || '')}
        </p>
        <p className="text-sm md:text-base text-gray-800">
          {showFullDescription ? profile?.bio : `${profile?.bio?.slice(0, maxLength)}`}
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
