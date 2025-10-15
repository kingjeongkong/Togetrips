import { GatheringWithDetails } from '@/features/gatherings/types/gatheringTypes';
import { useSession } from '@/providers/SessionProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { deleteGathering, leaveGathering } from '../services/sharedGatheringService';

export const useDeleteGathering = (gatheringId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { userId } = useSession();

  const { mutate: deleteGatheringMutation, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteGathering(gatheringId),
    onSuccess: () => {
      // Gathering 목록에서 해당 gathering 제거
      queryClient.setQueryData(['gatherings'], (oldData: GatheringWithDetails[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter((gathering) => gathering.id !== gatheringId);
      });

      // Gathering Chat Rooms 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['gatheringChatRooms', userId] });

      // 이전 페이지로 이동
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

/**
 * Shared Gathering Hook - Leave Action
 * Gathering에서 참여자만 제거 (Gathering과 Chat Room은 유지)
 */
export const useLeaveGathering = (gatheringId: string) => {
  const queryClient = useQueryClient();
  const { userId } = useSession();

  const { mutate: leaveGatheringMutation, isPending: isLeaving } = useMutation({
    mutationFn: () => leaveGathering(gatheringId),
    onSuccess: () => {
      if (!userId) return;

      // Gathering 목록의 Optimistic Update
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

      // Gathering 상세의 Optimistic Update
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
      // 최종적으로 서버 데이터와 동기화
      queryClient.invalidateQueries({ queryKey: ['gatherings'] });
      queryClient.invalidateQueries({ queryKey: ['gathering', gatheringId] });
    },
  });

  return { leaveGathering: leaveGatheringMutation, isLeaving };
};
