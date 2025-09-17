import { useQuery } from '@tanstack/react-query';
import { getGatherings } from '../services/gatheringService';

export const useGathering = () => {
  // 모임 목록 조회
  const {
    data: gatherings = [],
    isLoading: isListLoading,
    error: listError,
    refetch: refetchGatherings,
  } = useQuery({
    queryKey: ['gatherings'],
    queryFn: getGatherings,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    gatherings,
    isListLoading,
    listError,
    refetchGatherings,
  };
};
