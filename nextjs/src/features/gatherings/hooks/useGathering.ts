import { useMyProfile } from '@/features/shared/hooks/useUserProfile';
import { useSession } from '@/providers/SessionProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  deleteGathering,
  getGatheringById,
  getGatherings,
  joinGathering,
  leaveGathering,
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

// 모임 탈퇴
export const useLeaveGathering = (gatheringId: string) => {
  const queryClient = useQueryClient();
  const { userId } = useSession();

  const { mutate: leaveGatheringMutation, isPending: isLeaving } = useMutation({
    mutationFn: () => leaveGathering(gatheringId),
    onSuccess: () => {
      if (!userId) return;

      queryClient.setQueryData(['gatherings'], (oldData: GatheringWithDetails[] | undefined) => {
        if (!oldData) return oldData;

        return oldData.map((gathering) =>
          gathering.id === gatheringId
            ? {
                ...gathering,
                is_joined: false,
                participants: gathering.participants.filter((id: string) => id !== userId),
                participant_count: Math.max(0, gathering.participant_count - 1),
                participant_details: (gathering.participant_details || []).filter(
                  (participant) => participant.id !== userId,
                ),
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
            is_joined: false,
            participants: oldData.participants.filter((id: string) => id !== userId),
            participant_count: Math.max(0, oldData.participant_count - 1),
            participant_details: (oldData.participant_details || []).filter(
              (participant) => participant.id !== userId,
            ),
          };
        },
      );
    },
    onError: (error) => {
      console.error('모임 탈퇴 실패:', error);
      toast.error('Failed to leave gathering');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['gatherings'] });
      queryClient.invalidateQueries({ queryKey: ['gathering', gatheringId] });
    },
  });

  return {
    leaveGathering: leaveGatheringMutation,
    isLeaving,
  };
};

export const useDeleteGathering = (gatheringId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { userId } = useSession();

  const { mutate: deleteGatheringMutation, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteGathering(gatheringId),
    onSuccess: () => {
      queryClient.setQueryData(['gatherings'], (oldData: GatheringWithDetails[] | undefined) => {
        if (!oldData) return oldData;

        return oldData.filter((gathering) => gathering.id !== gatheringId);
      });
      queryClient.invalidateQueries({ queryKey: ['gatheringChatRooms', userId] });
      router.back();
      toast.success('Gathering and group chat deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete gathering:', error);
      toast.error('Failed to delete gathering');
    },
  });

  return { deleteGathering: deleteGatheringMutation, isDeleting };
};
