import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { createGathering, getGatheringById, getGatherings } from '../services/gatheringService';
import { CreateGatheringRequest } from '../types/gatheringTypes';

// 모임 목록 조회
export const useGathering = () => {
  const {
    data: gatherings = [],
    isLoading: isListLoading,
    refetch: refetchGatherings,
  } = useQuery({
    queryKey: ['gatherings'],
    queryFn: getGatherings,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    throwOnError: true,
  });

  return {
    gatherings,
    isListLoading,
    refetchGatherings,
  };
};

// 모임 상세 조회
export const useGatheringDetail = (id: string) => {
  const {
    data: gatheringDetail,
    isLoading: isDetailLoading,
    refetch: refetchGathering,
  } = useQuery({
    queryKey: ['gathering', id],
    queryFn: () => getGatheringById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    throwOnError: true,
  });

  return {
    gatheringDetail,
    isDetailLoading,
    refetchGathering,
  };
};

// 모임 생성
export const useCreateGathering = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    mutate: createGatheringMutation,
    isPending: isCreating,
    error: createError,
  } = useMutation({
    mutationFn: ({ data, file }: { data: CreateGatheringRequest; file: File }) =>
      createGathering(data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gatherings'] });
      router.push('/gatherings');
      toast.success('Gathering created successfully!');
    },
    onError: (error) => {
      console.error('모임 생성 실패:', error);
      toast.error('Failed to create gathering');
    },
  });

  return {
    createGathering: createGatheringMutation,
    isCreating,
    createError,
  };
};
