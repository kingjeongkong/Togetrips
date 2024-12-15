import { useEffect, useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import { UserProfile } from '../types/profileTypes';
import { profileService } from '../services/profileService';

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return;

      try {
        const profileData = await profileService.getProfile(user.uid);
        setProfile(profileData);
      } catch (error) {
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.uid || !profile) return;

    try {
      await profileService.updateProfile(user.uid, updates);
      setProfile({ ...profile, ...updates });
    } catch (error) {
      setError('Failed to update profile');
    }
  };

  return { profile, loading, error, updateProfile };
};
