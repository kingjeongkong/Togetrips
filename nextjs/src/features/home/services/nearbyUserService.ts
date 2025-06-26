/**
 * 같은 도시/주에 있는 주변 유저 목록을 가져온다.
 * 본인 제외, accepted/declined 상태의 요청이 있는 유저 제외(양방향)
 */
export async function fetchNearbyUsers(city: string, state: string, userId: string) {
  const response = await fetch(
    `/api/users/nearby?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch nearby users');
  }

  const data = await response.json();
  return data.users;
}
