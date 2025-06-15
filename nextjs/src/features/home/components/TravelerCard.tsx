'use client';

import { useSendRequest } from '@/features/home/hooks/useSendRequest';
import { formatHashTags } from '@/features/shared/utils/HashTags';
import Image from 'next/image';
import { useState } from 'react';
import RequestModal from './RequestModal';

interface User {
  id: string;
  name: string;
  image: string;
  bio: string;
  tags: string;
}

interface TravelerCardProps {
  user: User;
}

const TravelerCard = ({ user }: TravelerCardProps) => {
  const { name, image, bio, tags } = user;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { sendRequest, hasExistingRequest } = useSendRequest(user.id);

  const handleSendRequest = async (message: string) => {
    await sendRequest(message);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="overflow-hidden flex flex-col h-full px-4 py-3 bg-white rounded-3xl border-2 border-gray-200 shadow-lg hover:shadow-xl md:px-8 md:py-6">
        <div className="flex">
          <Image
            src={image || '/default-profile.png'}
            width={64}
            height={64}
            className="flex-shrink-0 w-12 h-12 rounded-full mr-2 md:w-16 md:h-16 md:mr-4"
            alt={name}
          />
          <div className="flex flex-col justify-center">
            <span className="text-base font-medium md:text-lg line-clamp-1 text-black">{name}</span>
            <span className="text-xs md:text-base line-clamp-1 text-orange-400">
              {formatHashTags(tags)}
            </span>
          </div>
        </div>

        <p className="flex-grow text-sm md:text-base line-clamp-4 mt-3 mb-5 text-gray-800">{bio}</p>

        <button
          className="w-full py-2 text-white bg-orange-500 rounded-3xl shadow-sm hover:bg-orange-600 hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={() => setIsModalOpen(true)}
          disabled={hasExistingRequest}
        >
          {hasExistingRequest ? 'Request Pending' : 'Send Request'}
        </button>
      </div>

      <RequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSendRequest}
        receiverName={name}
      />
    </>
  );
};

export default TravelerCard;
