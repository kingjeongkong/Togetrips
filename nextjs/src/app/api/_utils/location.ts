// 거리 계산 (Haversine 공식, km 단위)
export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** 위·경도에 랜덤 fuzzing 적용 (표시용 좌표 난독화). 매 호출마다 다른 값 반환. */
export function fuzzyCoordinate(
  lat: number,
  lng: number,
  options?: { minMeters?: number; maxMeters?: number },
): { lat: number; lng: number } {
  const minM = options?.minMeters ?? 50;
  const maxM = options?.maxMeters ?? 400;
  const distanceMeters = minM + Math.random() * (maxM - minM);
  const angleRad = Math.random() * 2 * Math.PI;
  const latRad = (lat * Math.PI) / 180;
  // 1도 lat ≈ 111km, 1도 lng ≈ 111*cos(lat) km
  const deltaLat = (distanceMeters * Math.cos(angleRad)) / 111_000;
  const deltaLng = (distanceMeters * Math.sin(angleRad)) / (111_000 * Math.cos(latRad));
  return {
    lat: lat + deltaLat,
    lng: lng + deltaLng,
  };
}

// 바운딩 박스 계산 (1도 ≈ 111km)
export function getBoundingBox(lat: number, lng: number, radius: number) {
  const delta = radius / 111;
  return {
    minLat: lat - delta,
    maxLat: lat + delta,
    minLng: lng - delta,
    maxLng: lng + delta,
  };
}

// 거리 오차 추가 (km 단위)
export function addDistanceErrorKm(distanceInKm: number): number {
  let errorInKm: number;
  if (distanceInKm < 1) {
    const errorPercentage = 0.3 + Math.random() * 0.2;
    errorInKm = distanceInKm * errorPercentage * (Math.random() - 0.5) * 2;
  } else if (distanceInKm < 5) {
    errorInKm = (Math.random() - 0.5) * 0.6;
  } else if (distanceInKm < 10) {
    errorInKm = (Math.random() - 0.5) * 1;
  } else {
    errorInKm = (Math.random() - 0.5) * 1.6;
  }
  return Math.max(0.1, distanceInKm + errorInKm);
}

// request 상태 있는 유저 제외 (accepted, declined, pending)
export function getExcludedUserIds(
  sentRequests: { receiver_id: string }[],
  receivedRequests: { sender_id: string }[],
): Set<string> {
  const excludedUserIds = new Set<string>();
  sentRequests?.forEach((r) => excludedUserIds.add(r.receiver_id));
  receivedRequests?.forEach((r) => excludedUserIds.add(r.sender_id));
  return excludedUserIds;
}
