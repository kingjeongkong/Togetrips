import type { User } from '@/features/shared/types/User';
import type { DistanceFilter } from '../types/filterTypes';

// 사용자 목록을 거리 필터에 따라 필터링하는 함수
export const filterUsersByDistance = (users: User[], distanceFilter: DistanceFilter): User[] => {
  return users.filter((user) => {
    if (user.distance === undefined) {
      // 거리 정보가 없는 사용자는 기본적으로 제외
      return false;
    }

    // user.distance는 미터 단위, distanceFilter는 km 단위이므로 변환 필요
    // TODO: 거리 단위 통일 필요 (user.distance를 수정해야할 듯 -> km 단위로)
    const userDistanceKm = user.distance / 1000;
    return (
      userDistanceKm >= distanceFilter.minDistance && userDistanceKm <= distanceFilter.maxDistance
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
