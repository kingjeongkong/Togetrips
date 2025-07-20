export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  tags: string;
  bio: string;
  location: {
    city: string;
    state: string;
    lat?: number;
    lng?: number;
  };
  distance?: number; // 현재 사용자와의 거리 (미터 단위, 선택적)
  createdAt: string;
  updatedAt: string;
}
