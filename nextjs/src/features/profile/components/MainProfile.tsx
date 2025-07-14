import LoadingIndicator from '@/components/LoadingIndicator';
import LogoutMenu from '@/features/shared/components/LogoutMenu';
import { useMyProfile } from '@/features/shared/hooks/useUserProfile';
import { EditableProfileFields } from '@/features/shared/types/profileTypes';
import { splitHashTags } from '@/features/shared/utils/HashTags';
import { useAuthActions } from '@/hooks/useAuthActions';
import Image from 'next/image';
import { useState } from 'react';
import { FiEdit, FiSettings } from 'react-icons/fi';
import EditProfileForm from './EditProfileForm';

const ProfileHeaderActions = ({
  settingsOpen,
  setSettingsOpen,
  handleLogout,
}: {
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  handleLogout: () => void;
}) => (
  <div className="absolute top-4 right-4 md:top-7 md:right-7">
    <button
      className="p-2 rounded-full bg-indigo-500 hover:bg-indigo-600"
      onClick={() => setSettingsOpen(!settingsOpen)}
      aria-label="Settings"
    >
      <FiSettings className="w-6 h-6 md:w-8 md:h-8 text-white" />
    </button>
    {settingsOpen && (
      <LogoutMenu onLogout={handleLogout} onClose={() => setSettingsOpen(false)} direction="down" />
    )}
  </div>
);

const MainProfile = () => {
  const { profile, isLoading, updateProfile } = useMyProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { handleSignOut } = useAuthActions();

  const handleSubmit = async (data: EditableProfileFields) => {
    await updateProfile(data);
    setIsEditing(false);
  };

  const loadingIndicator = (
    <div className="w-full h-[400px] flex items-center justify-center">
      <LoadingIndicator color="#6366f1" size={50} />
    </div>
  );

  // 프로필이 없거나 로딩 중일 때
  if (isLoading || !profile) {
    return (
      <div className="flex flex-col items-center w-full pt-10 relative">
        <ProfileHeaderActions
          settingsOpen={settingsOpen}
          setSettingsOpen={setSettingsOpen}
          handleLogout={handleSignOut}
        />
        {loadingIndicator}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full pt-10 relative">
      <ProfileHeaderActions
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        handleLogout={handleSignOut}
      />

      {isEditing ? (
        <EditProfileForm
          onCancle={() => setIsEditing(false)}
          onSubmit={handleSubmit}
          initialData={profile as EditableProfileFields}
        />
      ) : (
        <>
          <Image
            src={profile.image || '/default-traveler.png'}
            width={200}
            height={200}
            className="w-40 h-40 md:w-52 md:h-52 rounded-full object-cover mb-6 shadow-lg"
            alt={profile.name || 'profile'}
          />
          <div className="text-2xl md:text-3xl font-bold text-center mb-3 text-black">
            {profile.name}
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {splitHashTags(profile.tags || '').map((tag: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 text-white bg-orange-400 rounded-3xl text-sm md:text-base font-semibold"
              >
                #{tag.trim()}
              </span>
            ))}
          </div>
          <div className="text-center text-gray-600 w-4/5 text-base md:w-1/2 md:text-lg mb-8">
            {profile.bio}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-3xl text-white bg-indigo-500 hover:bg-indigo-600 shadow-md"
          >
            <FiEdit className="w-5 h-5" />
            <span>Edit Profile</span>
          </button>
        </>
      )}
    </div>
  );
};

export default MainProfile;
