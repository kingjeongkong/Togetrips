import { useEffect, useState } from 'react';
import { locationService } from '../service/locationService';
import { UserProfile } from '../../../types/profileTypes';
import { useAuthStore } from '../../../../../store/useAuthStore';
import { requestService } from '../../../services/requestService';

export const useNearbyUsers = (cityInfo: { city: string; state: string }) => {
  const user = useAuthStore((state) => state.user);
  const [nearbyUsers, setNearbyUsers] = useState<UserProfile[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNearbyUsers = async () => {
      if (cityInfo.city && cityInfo.state && user?.uid) {
        // 1. 같은 도시의 모든 사용자 가져오기
        const users = await locationService.findUsersInSameCity(
          cityInfo.city,
          cityInfo.state
        );

        // 2. 현재 사용자 제외
        const otherUsers = users.filter((u) => u.uid !== user.uid);

        // 3. accepted/declined 상태의 요청이 있는 사용자 분류
        const filteredUsers = await Promise.all(
          otherUsers.map(async (otherUser) => {
            const hasCompletedRequest = await requestService.checkRequestByStatus(
              user.uid,
              otherUser.uid,
              ['accepted', 'declined']
            );
            return { user: otherUser, hasCompletedRequest };
          })
        );

        // 4.completed 요청이 없는 사용자만 설정 (즉, 요청이 없거나 pending 상태인 사용자만 표시)
        setNearbyUsers(
          filteredUsers
            .filter((item) => !item.hasCompletedRequest)
            .map((item) => item.user)
        );

        setIsLoading(false);
      }
    };

    fetchNearbyUsers();
  }, [cityInfo.city, cityInfo.state, user?.uid]);

  return { nearbyUsers, isLoading };
};
