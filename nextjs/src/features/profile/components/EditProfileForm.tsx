import LoadingIndicator from '@/components/LoadingIndicator';
import { EditableProfileFields } from '@/features/shared/types/profileTypes';
import Image from 'next/image';
import React, { useRef, useState } from 'react';

interface EditProfileFormProps {
  onCancle: () => void;
  onSubmit?: (data: EditableProfileFields) => void;
  initialData: EditableProfileFields;
}

const EditProfileForm = ({ onCancle, onSubmit, initialData }: EditProfileFormProps) => {
  // 기본값 제공
  const defaultData: EditableProfileFields = {
    name: '',
    image: '',
    tags: '',
    bio: '',
  };

  const [formData, setFormData] = useState(initialData || defaultData);
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.image || null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const photoFile = e.target.files?.[0];
    if (photoFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(photoFile);
      setFormData({ ...formData, photoFile });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSubmit?.(formData);
      onCancle();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {isSaving && (
        <div className="absolute inset-0 flex items-center justify-center z-10 w-full h-full bg-gray-100/80">
          <LoadingIndicator color="#6366f1" size={70} />
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4 items-center md:pt-5">
        <div className="relative">
          <Image
            src={previewImage || initialData?.image || '/default-traveler.png'}
            width={200}
            height={200}
            alt="profile"
            onClick={handleImageClick}
            className="w-40 h-40 md:w-52 md:h-52 rounded-full cursor-pointer hover:opacity-80 bg-white object-cover"
          />
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
          />
        </div>

        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="text-2xl md:text-3xl font-semibold text-center bg-transparent border-b-2 border-indigo-500 focus:outline-none text-black"
          placeholder="Enter your name"
        />

        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="p-2 text-sm border-none rounded focus:border-2 focus:border-indigo-500 w-3/5 md:w-1/3 text-black bg-white"
          placeholder="Add tags with # (ex. #fishing #camping)"
        />

        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="text-gray-600 w-4/5 h-72 text-base md:w-1/2 md:text-lg p-2 border-none rounded focus:border-2 focus:border-indigo-500 bg-white"
          rows={4}
          placeholder="Tell us about yourself..."
        />

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancle}
            className="px-4 py-2 rounded-3xl text-white bg-gray-500 hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-3xl text-white bg-indigo-500 hover:bg-indigo-600"
          >
            Save
          </button>
        </div>
      </form>
    </>
  );
};

export default EditProfileForm;
