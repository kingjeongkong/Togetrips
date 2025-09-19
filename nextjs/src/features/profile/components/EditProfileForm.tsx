import LoadingIndicator from '@/components/LoadingIndicator';
import { EditableProfileFields } from '@/features/shared/types/profileTypes';
import { compressImage } from '@/features/shared/utils/imageCompression';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

interface EditProfileFormProps {
  onCancle: () => void;
  onSubmit?: (formData: FormData) => void;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const photoFile = e.target.files?.[0];
    if (!photoFile) return;

    // 파일 유효성 검사
    if (!photoFile.type.startsWith('image/')) {
      console.error('Please select a valid image file');
      return;
    }

    setIsProcessing(true);

    try {
      const compressedFile = await compressImage(photoFile);
      setSelectedFile(compressedFile);

      // 기존 URL 정리
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const url = URL.createObjectURL(compressedFile);
      setPreviewUrl(url);
    } catch (error) {
      console.error('이미지 처리 중 오류 발생:', error);
      // 압축 실패 시 원본 파일 사용
      setSelectedFile(photoFile);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const url = URL.createObjectURL(photoFile);
      setPreviewUrl(url);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('name', formData.name);
      formDataToSubmit.append('bio', formData.bio);
      formDataToSubmit.append('tags', formData.tags);

      if (selectedFile) {
        formDataToSubmit.append('image', selectedFile);
      }

      await onSubmit?.(formDataToSubmit);
      onCancle();
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <>
      {isSaving && (
        <div className="absolute inset-0 flex items-center justify-center z-10 w-full h-full bg-gray-100/80">
          <LoadingIndicator color="#6366f1" size={70} />
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full gap-4 items-center md:pt-5 pb-12 md:pb-8"
      >
        <div className="relative">
          <div
            className={`w-40 h-40 md:w-52 md:h-52 rounded-full cursor-pointer hover:opacity-80 bg-white object-cover flex items-center justify-center ${
              isProcessing ? 'cursor-not-allowed opacity-50' : ''
            }`}
            onClick={() => !isProcessing && handleImageClick()}
          >
            {isProcessing ? (
              <div className="text-center">
                <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-indigo-600 font-medium text-sm">Processing...</p>
              </div>
            ) : previewUrl ? (
              <Image
                src={previewUrl}
                width={200}
                height={200}
                alt="profile preview"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Image
                src={initialData?.image || '/default-traveler.png'}
                width={200}
                height={200}
                alt="profile"
                className="w-full h-full rounded-full object-cover"
              />
            )}
          </div>
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
          aria-label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="text-2xl md:text-3xl font-semibold text-center bg-transparent border-b-2 border-indigo-500 focus:outline-none text-black"
          placeholder="Enter your name"
        />

        <input
          type="text"
          aria-label="Tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="p-2 text-sm border-none rounded focus:border-2 focus:border-indigo-500 w-3/5 md:w-1/3 text-black bg-white"
          placeholder="Add tags with # (ex. #fishing #camping)"
        />

        <textarea
          aria-label="Bio"
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
