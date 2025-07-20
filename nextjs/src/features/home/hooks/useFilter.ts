'use client';

import { useState } from 'react';
import type { DistanceFilter } from '../types/filterTypes';
import { DEFAULT_DISTANCE_FILTER } from '../types/filterTypes';

// 추후 필터링 로직 추가를 위한 훅으로 분리
export const useFilter = () => {
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>(DEFAULT_DISTANCE_FILTER);

  const applyDistanceFilter = (filter: DistanceFilter) => {
    setDistanceFilter(filter);
  };

  return {
    distanceFilter,
    applyDistanceFilter,
  };
};
