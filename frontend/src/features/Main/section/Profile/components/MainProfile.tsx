import { FiEdit, FiSettings } from 'react-icons/fi';
import { useState } from 'react';
import EditProfileForm from './EditProfileForm';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { EditableProfileFields } from '../../../types/profileTypes';
import { splitHashTags } from '../../../utils/HashTags';
import LoadingIndicator from '../../../../../components/LoadingIndicator';

const MainProfile = () => {
  const { profile, isLoading, updateProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (data: EditableProfileFields) => {
    try {
      await updateProfile(data);
      setIsEditing(false);
    } catch (error) {
      // TODO: 에러 처리
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center md:pt-5">
      <button className="absolute top-16 right-4 md:top-7 md:right-7 p-2 rounded-full bg-indigo-500 hover:bg-indigo-600">
        <FiSettings className="w-6 h-6 md:w-8 md:h-8 text-white" />
      </button>

      {isEditing ? (
        <EditProfileForm
          onCancle={() => setIsEditing(false)}
          onSubmit={handleSubmit}
          initialData={profile as EditableProfileFields}
        />
      ) : (
        <>
          {isLoading ? (
            <div className="w-full h-[400px] flex items-center justify-center">
              <LoadingIndicator color="#6366f1" size={50} />
            </div>
          ) : (
            <>
              <img
                src={profile?.photoURL || ''}
                className={`w-40 h-40 md:w-52 md:h-52 rounded-full ${
                  profile?.photoURL ? '' : 'border border-gray-400'
                }`}
              />

              <p className="text-2xl md:text-3xl font-semibold">{profile?.name}</p>

              <div className="flex flex-wrap justify-center gap-2 w-4/5 md:w-2/5">
                {splitHashTags(profile?.tags || '').map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-white bg-orange-400 rounded-3xl text-sm md:text-base"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>

              <div className="text-center text-gray-600 w-4/5 text-base md:w-1/2 md:text-lg">
                {profile?.bio}
              </div>
            </>
          )}

          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 mt-6 px-4 py-2 rounded-3xl text-white bg-indigo-500 hover:bg-indigo-600"
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
