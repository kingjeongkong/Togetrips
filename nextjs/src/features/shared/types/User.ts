export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  tags: string;
  bio: string;
  location: {
    id: string;
    city: string;
    state: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  distance?: number; // 현재 사용자와의 거리 (미터 단위, 선택적)
  createdAt: string;
  updatedAt: string;
}
