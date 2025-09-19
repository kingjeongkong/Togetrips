import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  createGathering,
  getGatheringById,
  getGatherings,
  joinGathering,
  leaveGathering,
} from '../services/gatheringService';
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
export const useCreateGathering = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  const {
    mutate: createGatheringMutation,
    isPending: isCreating,
    error: createError,
  } = useMutation({
    mutationFn: ({ data, file }: { data: CreateGatheringRequest; file: File }) =>
      createGathering(data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gatherings'] });
      if (onSuccess) {
        onSuccess();
      }
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

// 모임 참여
export const useJoinGathering = (gatheringId: string) => {
  const queryClient = useQueryClient();

  const { mutate: joinGatheringMutation, isPending: isJoining } = useMutation({
    mutationFn: () => joinGathering(gatheringId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gathering', gatheringId] });
    },
    onError: (error) => {
      console.error('모임 참여 실패:', error);
      toast.error('Failed to join gathering');
    },
  });

  return {
    joinGathering: joinGatheringMutation,
    isJoining,
  };
};

// 모임 탈퇴
export const useLeaveGathering = (gatheringId: string) => {
  const queryClient = useQueryClient();

  const { mutate: leaveGatheringMutation, isPending: isLeaving } = useMutation({
    mutationFn: () => leaveGathering(gatheringId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gathering', gatheringId] });
    },
    onError: (error) => {
      console.error('모임 탈퇴 실패:', error);
      toast.error('Failed to leave gathering');
    },
  });

  return {
    leaveGathering: leaveGatheringMutation,
    isLeaving,
  };
};
