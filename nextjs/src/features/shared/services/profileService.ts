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
   * 유저 프로필 수정 (FormData로 통합 처리)
   */
  async updateProfile(formData: FormData): Promise<User> {
    const response = await fetch('/api/user/profile/update', {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update profile');
    }

    const data = await response.json();
    return data.profile as User;
  },
};
