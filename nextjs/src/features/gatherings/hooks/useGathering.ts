import { useMyProfile } from '@/features/shared/hooks/useUserProfile';
import { useSession } from '@/providers/SessionProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  getGatheringById,
  getGatherings,
  joinGathering,
  upsertGathering,
} from '../services/gatheringService';
import { GatheringWithDetails, UpsertGatheringRequest } from '../types/gatheringTypes';

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

// 모임 생성/수정
export const useUpsertGathering = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  const {
    mutate: upsertGatheringMutation,
    isPending: isCreating,
    error: createError,
  } = useMutation({
    mutationFn: ({
      data,
      file,
      gatheringId,
    }: {
      data: UpsertGatheringRequest;
      file?: File;
      gatheringId?: string;
    }) => upsertGathering(data, file, gatheringId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gatherings'] });
      if (variables.gatheringId) {
        queryClient.invalidateQueries({ queryKey: ['gathering', variables.gatheringId] });
      }
      if (onSuccess) {
        onSuccess();
      }
      toast.success(
        variables.gatheringId
          ? 'Gathering updated successfully!'
          : 'Gathering created successfully!',
      );
    },
    onError: (error, variables) => {
      console.error('모임 생성/수정 실패:', error);
      toast.error(`Failed to ${variables.gatheringId ? 'update' : 'create'} gathering`);
    },
  });

  return {
    upsertGathering: upsertGatheringMutation,
    isCreating,
    createError,
  };
};

// 모임 참여
export const useJoinGathering = (gatheringId: string) => {
  const queryClient = useQueryClient();
  const { userId } = useSession();
  const { profile: currentUserProfile } = useMyProfile();

  const { mutate: joinGatheringMutation, isPending: isJoining } = useMutation({
    mutationFn: () => joinGathering(gatheringId),
    onSuccess: () => {
      if (!userId || !currentUserProfile) return;

      const currentUserDetail = {
        id: currentUserProfile.id,
        name: currentUserProfile.name,
        image: currentUserProfile.image,
      };

      queryClient.setQueryData(['gatherings'], (oldData: GatheringWithDetails[] | undefined) => {
        if (!oldData) return oldData;

        return oldData.map((gathering) =>
          gathering.id === gatheringId
            ? {
                ...gathering,
                is_joined: true,
                participants: [...gathering.participants, userId],
                participant_count: gathering.participant_count + 1,
                participant_details: [...(gathering.participant_details || []), currentUserDetail],
              }
            : gathering,
        );
      });

      queryClient.setQueryData(
        ['gathering', gatheringId],
        (oldData: GatheringWithDetails | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            is_joined: true,
            participants: [...oldData.participants, userId],
            participant_count: oldData.participant_count + 1,
            participant_details: [...(oldData.participant_details || []), currentUserDetail],
          };
        },
      );
    },
    onError: (error) => {
      console.error('모임 참여 실패:', error);
      toast.error('Failed to join gathering');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['gatherings'] });
      queryClient.invalidateQueries({ queryKey: ['gathering', gatheringId] });
    },
  });

  return {
    joinGathering: joinGatheringMutation,
    isJoining,
  };
};
