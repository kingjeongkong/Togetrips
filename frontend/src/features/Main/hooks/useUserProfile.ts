import { useEffect, useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import { EditableProfileFields, UserProfile } from '../types/profileTypes';
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

  const updateProfile = async (updates: EditableProfileFields) => {
    if (!user?.uid || !profile) return;

    try {
      const photoURL = updates.photoFile
        ? await profileService.uploadProfileImage(user.uid, updates.photoFile)
        : profile.photoURL;

      const { photoFile, ...updateData } = updates;
      const dataToUpdate = { ...updateData, photoURL };

      await profileService.updateProfile(user.uid, dataToUpdate);
      setProfile({ ...profile, ...dataToUpdate });
    } catch (error) {
      setError('Failed to update profile');
      throw error;
    }
  };

  return { profile, loading, error, updateProfile };
};
