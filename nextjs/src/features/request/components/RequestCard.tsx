'use client';

import {
  acceptRequest,
  createChatRoom,
  declineRequest,
  revertRequestStatus,
} from '@/features/shared/services/requestService';
import type { Request, RequestUserProfile } from '@/features/shared/types/Request';
import { formatHashTags } from '@/features/shared/utils/HashTags';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';

interface RequestCardProps {
  request: Request & { sender: RequestUserProfile };
}

const RequestCard = ({ request }: RequestCardProps) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [isProcessing, setIsProcessing] = useState(false);
  const isFetching = useIsFetching({ queryKey: ['requests', userId] });
  const isLoading = isProcessing || isFetching > 0;

  const onStatusChange = () => {
    queryClient.invalidateQueries({ queryKey: ['requests', userId] });
  };

  const updateTravelerCard = () => {
    queryClient.invalidateQueries({
      queryKey: [
        'nearbyUsers',
        userId,
        request.sender.location.city,
        request.sender.location.state,
      ],
    });
  };

  const handleAccept = async () => {
    setIsProcessing(true);

    // 1. Request 수락
    const success = await acceptRequest(request.id);
    if (!success) {
      setIsProcessing(false);
      return;
    }

    // 2. Chat Room 생성
    const chatRoomID = await createChatRoom([request.senderID, request.receiverID]);

    if (chatRoomID) {
      onStatusChange();
      updateTravelerCard();
    } else {
      // ChatRoom 생성 실패 시 request 상태 pending으로 복구
      await revertRequestStatus(request.id);
    }

    setIsProcessing(false);
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    const success = await declineRequest(request.id);
    if (success) {
      onStatusChange();
      updateTravelerCard();
    }
    setIsProcessing(false);
  };

  return (
    <div className="overflow-hidden flex flex-col h-full px-5 py-4 bg-white rounded-3xl border-2 border-gray-200 shadow-lg hover:shadow-xl md:px-8 md:py-6">
      <div className="flex">
        <Image
          src={request.sender.image || '/default-traveler.png'}
          alt="profile"
          width={64}
          height={64}
          className="w-12 h-12 rounded-full mr-2 md:w-16 md:h-16 md:mr-4"
        />
        <div className="flex flex-col justify-center">
          <span className="text-base font-medium text-gray-800 md:text-lg line-clamp-1">
            {request.sender.name || ''}
          </span>
          <span className="text-sm text-orange-400 md:text-base line-clamp-1">
            {formatHashTags(request.sender.tags || '')}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-500 text-center mt-3 md:text-base">Request Message</p>

      <p className="flex-grow px-2 text-sm text-center text-gray-700 line-clamp-4 mt-1 mb-5 md:text-base">
        {request.message || ''}
      </p>

      <div className="flex gap-3">
        <button
          className="w-full py-2 text-white bg-green-600 rounded-3xl shadow-sm hover:bg-green-700 hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={handleAccept}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Accept'}
        </button>

        <button
          className="w-full py-2 text-white bg-red-600 rounded-3xl shadow-sm hover:bg-red-700 hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={handleDecline}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Decline'}
        </button>
      </div>
    </div>
  );
};

export default RequestCard;
