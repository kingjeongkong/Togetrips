'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import { respondToRequest } from '@/features/shared/services/requestService';
import type { Request, RequestUserProfile } from '@/features/shared/types/Request';
import { formatHashTags } from '@/features/shared/utils/HashTags';
import { useSession } from '@/providers/SessionProvider';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'react-toastify';

const TravelerDetailModal = dynamic(
  () => import('@/features/shared/components/TravelerDetailModal'),
  {
    loading: () => (
      <div className="flex items-center justify-center p-4">
        <LoadingIndicator color="#6366f1" size={50} />
      </div>
    ),
    ssr: false,
  },
);

interface RequestCardProps {
  request: Request & { sender: RequestUserProfile };
}

const RequestCard = ({ request }: RequestCardProps) => {
  const queryClient = useQueryClient();
  const { userId } = useSession();
  const [selectedTravelerId, setSelectedTravelerId] = useState<string | null>(null);

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
    try {
      await respondToRequest(request.id, 'accept');
      onStatusChange();
      updateTravelerCard();
      toast.success('Request accepted successfully! Chat room is created.');
    } catch (error) {
      toast.error('Failed to accept request. Please try again.');
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to accept request:', error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    try {
      await respondToRequest(request.id, 'decline');
      onStatusChange();
      updateTravelerCard();
    } catch (error) {
      toast.error('Failed to decline request. Please try again.');
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to decline request:', error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div
        className="overflow-hidden flex flex-col h-full px-5 py-4 bg-white rounded-3xl border-2 border-gray-200 shadow-lg hover:shadow-xl md:px-8 md:py-6 cursor-pointer"
        onClick={() => setSelectedTravelerId(request.senderId)}
        role="button"
        tabIndex={0}
        style={{ outline: 'none' }}
      >
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
            onClick={(e) => {
              e.stopPropagation();
              handleAccept();
            }}
            disabled={isLoading}
            aria-label={
              isLoading
                ? 'Processing accept'
                : `Accept request from ${request.sender.name || 'traveler'}`
            }
          >
            {isLoading ? 'Processing...' : 'Accept'}
          </button>

          <button
            className="w-full py-2 text-white bg-red-600 rounded-3xl shadow-sm hover:bg-red-700 hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={(e) => {
              e.stopPropagation();
              handleDecline();
            }}
            disabled={isLoading}
            aria-label={
              isLoading
                ? 'Processing decline'
                : `Decline request from ${request.sender.name || 'traveler'}`
            }
          >
            {isLoading ? 'Processing...' : 'Decline'}
          </button>
        </div>
      </div>

      <TravelerDetailModal
        isOpen={!!selectedTravelerId}
        onClose={() => setSelectedTravelerId(null)}
        travelerId={selectedTravelerId ?? ''}
        showRequestButton={false}
      />
    </>
  );
};

export default RequestCard;
