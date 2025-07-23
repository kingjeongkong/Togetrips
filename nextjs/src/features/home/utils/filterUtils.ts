import type { User } from '@/features/shared/types/User';
import type { DistanceFilter } from '../types/filterTypes';

// 사용자 목록을 거리 필터에 따라 필터링하는 함수
export const filterUsersByDistance = (users: User[], distanceFilter: DistanceFilter): User[] => {
  return users.filter((user) => {
    if (user.distance === undefined) {
      // 거리 정보가 없는 사용자는 기본적으로 제외
      return false;
    }

    return (
      user.distance >= distanceFilter.minDistance && user.distance <= distanceFilter.maxDistance
    );
  });
};

// 슬라이더 값(0-100)을 실제 거리 범위로 변환 (km 단위)
export const sliderValueToDistance = (sliderValue: number, maxDistance: number): number => {
  return Math.round((sliderValue / 100) * maxDistance);
};

// 실제 거리를 슬라이더 값(0-100)으로 변환
export const distanceToSliderValue = (distance: number, maxDistance: number): number => {
  return Math.min(100, (distance / maxDistance) * 100);
};
