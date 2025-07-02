'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import RequestModal from '@/features/home/components/RequestModal';
import useProfile from '@/features/home/hooks/useProfile';
import { useSendRequest } from '@/features/home/hooks/useSendRequest';
import { formatHashTags } from '@/features/shared/utils/HashTags';
import Image from 'next/image';
import { useState } from 'react';
import { IoClose } from 'react-icons/io5';

interface TravelerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  travelerID: string;
}

const TravelerDetailModal = ({ isOpen, onClose, travelerID }: TravelerDetailModalProps) => {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const { profile, isLoading: profileLoading } = useProfile(travelerID);
  const { sendRequest, isRequestSent, isLoading } = useSendRequest(travelerID);

  const handleSendRequest = async (message: string) => {
    try {
      await sendRequest(message);
      setIsRequestModalOpen(false);
    } catch (error) {
      console.error('Error sending request:', error);
      // TODO: 에러 처리 (예: 토스트 메시지)
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-3xl max-w-xl w-full max-h-[70vh] shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
          style={{ minHeight: 400 }}
        >
          {profileLoading ? (
            <div className="p-8 flex items-center justify-center flex-1">
              <LoadingIndicator color="#f97361" size={40} />
            </div>
          ) : (
            <>
              <div className="relative p-6 border-b border-gray-200 shrink-0">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <IoClose size={28} />
                </button>
                <div className="flex items-center space-x-4">
                  <Image
                    src={profile?.image || '/default-traveler.png'}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover"
                    alt={profile?.name || 'Traveler'}
                  />
                  <h2 className="flex-1 text-xl font-bold text-gray-800">
                    {profile?.name || 'Traveler'}
                  </h2>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {profile?.bio || 'No bio available'}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {formatHashTags(profile?.tags || '')
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

              <div className="pt-4 border-t border-gray-200 shrink-0 px-6 pb-6">
                <button
                  className="w-full py-3 text-white bg-orange-500 rounded-3xl shadow-sm hover:bg-orange-600 hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200"
                  onClick={() => setIsRequestModalOpen(true)}
                  disabled={isRequestSent || isLoading}
                >
                  {isLoading && <LoadingIndicator color="#ffffff" size={16} />}
                  {isLoading
                    ? 'Loading...'
                    : isRequestSent
                      ? 'Request Pending'
                      : 'Send Travel Request'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <RequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmit={handleSendRequest}
        receiverName={profile?.name || 'Traveler'}
      />
    </>
  );
};

export default TravelerDetailModal;
