import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/useAuthStore';
import { requestService } from '../../shared/services/requestService';
import { UserProfile } from '../../shared/types/profileTypes';
import { locationService } from '../services/locationService';

export const useNearbyUsers = (cityInfo: { city: string; state: string }) => {
  const user = useAuthStore((state) => state.user);

  const { data: nearbyUsers = null, isLoading } = useQuery<UserProfile[]>({
    queryKey: ['nearbyUsers', user?.uid, cityInfo.city, cityInfo.state],
    queryFn: async () => {
      // 1. 같은 도시의 모든 사용자 가져오기
      const users = await locationService.findUsersInSameCity(
        cityInfo.city,
        cityInfo.state
      );

      // 2. 현재 사용자 제외
      const otherUsers = users.filter((u) => u.uid !== user?.uid);

      // 3. accepted/declined 상태의 요청이 있는 사용자 분류
      const filteredUsers = await Promise.all(
        otherUsers.map(async (otherUser) => {
          const hasCompletedRequest = await requestService.checkRequestByStatus(
            user!.uid,
            otherUser.uid,
            ['accepted', 'declined']
          );
          return { user: otherUser, hasCompletedRequest };
        })
      );

      // 4.completed 요청이 없는 사용자만 설정 (즉, 요청이 없거나 pending 상태인 사용자만 표시)
      return filteredUsers
        .filter((item) => !item.hasCompletedRequest)
        .map((item) => item.user);
    },
    enabled: !!user?.uid && !!cityInfo.city && !!cityInfo.state,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

  return { nearbyUsers, isLoading };
};
