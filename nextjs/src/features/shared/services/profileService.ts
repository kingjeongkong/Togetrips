import type { User } from '@/features/shared/types/User';

export const profileService = {
  /**
   * 유저 프로필 조회
   */
  async getProfile(userId: string): Promise<User | null> {
    try {
      const response = await fetch(`/api/users/profile?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      return data.user as User;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  /**
   * 프로필 이미지 업로드 (서버 API 호출)
   */
  async uploadProfileImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/user/profile/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload image');
    }

    const data = await response.json();
    return data.imageUrl;
  },

  /**
   * 유저 프로필 수정 (서버 API 호출)
   */
  async updateProfile(updates: Partial<User>): Promise<void> {
    const response = await fetch('/api/user/profile/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update profile');
    }

    return response.json();
  },
};
