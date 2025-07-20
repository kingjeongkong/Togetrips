export interface DistanceFilter {
  minDistance: number;
  maxDistance: number;
}

export const DEFAULT_DISTANCE_FILTER: DistanceFilter = {
  minDistance: 0,
  maxDistance: 30,
};
