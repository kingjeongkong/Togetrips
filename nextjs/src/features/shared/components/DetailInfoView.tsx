'use client';

import { formatHashTags } from '@/features/shared/utils/HashTags';

interface UserInfoViewProps {
  bio?: string;
  tags?: string;
}

const UserInfoView = ({ bio, tags }: UserInfoViewProps) => {
  return (
    <div className="p-6 pt-3 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
        <p className="text-gray-700 leading-relaxed">{bio || 'No bio available'}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Interests</h3>
        <div className="flex flex-wrap gap-2">
          {formatHashTags(tags || '')
            .split(' ')
            .filter((tag) => tag.trim())
            .map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default UserInfoView;
