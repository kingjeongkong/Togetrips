'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import { getMyRequests } from '@/features/shared/services/requestService';
import type { Request, RequestUserProfile } from '@/features/shared/types/Request';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import RequestCard from './RequestCard';

const RequestCardList = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: requests = [], isLoading } = useQuery<(Request & { sender: RequestUserProfile })[]>(
    {
      queryKey: ['requests', userId],
      queryFn: () => getMyRequests(),
      enabled: !!userId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  );

  if (isLoading || !userId) {
    return (
      <div className="w-full h-[150px] flex items-center justify-center">
        <LoadingIndicator color="#6366f1" size={50} />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center text-xl font-semibold text-indigo-500 mt-10">No Requests</div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 w-full px-5 md:px-10 md:grid-cols-3 md:gap-8">
      {requests.map((request, index) => (
        <RequestCard key={index} request={request} />
      ))}
    </div>
  );
};

export default RequestCardList;
