'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import RequestModal from '@/features/home/components/RequestModal';
import useUserProfileById from '@/features/home/hooks/useProfile';
import { useSendRequest } from '@/features/home/hooks/useSendRequest';
import { useUserLocation } from '@/features/home/hooks/useUserLocation';
import { getDistanceText } from '@/features/home/utils/location';
import UserInfoView from '@/features/shared/components/DetailInfoView';
import UserLocationView from '@/features/shared/components/DetailLocationView';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { IoClose, IoLocationOutline, IoPersonOutline } from 'react-icons/io5';

interface TravelerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  travelerID: string;
  distance?: number;
}

type TabType = 'info' | 'location';

const TravelerDetailModal = ({
  isOpen,
  onClose,
  travelerID,
  distance,
}: TravelerDetailModalProps) => {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const { profile, isLoading: profileLoading } = useUserProfileById(travelerID);
  const { users } = useUserLocation();
  const { sendRequest, isRequestSent, isLoading } = useSendRequest(travelerID);

  // 모달이 열릴 때 탭을 'info'로 초기화
  useEffect(() => {
    if (isOpen) {
      setActiveTab('info');
    }
  }, [isOpen]);

  // users 데이터에서 해당 사용자 정보 찾기
  const userLocation = useMemo(() => {
    if (!users) return null;
    const user = users.find((u: any) => u.id === travelerID);
    if (user && user.location_lat && user.location_lng) {
      return {
        latitude: user.location_lat,
        longitude: user.location_lng,
      };
    }
    return null;
  }, [users, travelerID]);

  const handleSendRequest = async (message: string) => {
    try {
      await sendRequest(message);
      setIsRequestModalOpen(false);
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const distanceText = getDistanceText(distance);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-3xl max-w-xl w-full max-h-[80vh] shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
          style={{ minHeight: 500 }}
        >
          {profileLoading ? (
            <div className="p-8 flex items-center justify-center flex-1">
              <LoadingIndicator color="#f97361" size={40} />
            </div>
          ) : (
            <>
              <div className="relative p-6 pb-2 shrink-0">
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
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800">
                      {profile?.name || 'Traveler'}
                    </h2>
                    {distanceText && <p className="text-sm text-gray-500 mt-1">{distanceText}</p>}
                  </div>
                </div>

                <div className="flex mt-2 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'info'
                        ? 'text-orange-500 border-b-2 border-orange-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <IoPersonOutline size={16} />
                    About
                  </button>
                  <button
                    onClick={() => setActiveTab('location')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'location'
                        ? 'text-orange-500 border-b-2 border-orange-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <IoLocationOutline size={16} />
                    Location
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">
                {activeTab === 'info' ? (
                  <UserInfoView bio={profile?.bio} tags={profile?.tags} />
                ) : userLocation ? (
                  <UserLocationView
                    otherUserLatitude={userLocation.latitude}
                    otherUserLongitude={userLocation.longitude}
                    userName={profile?.name}
                  />
                ) : (
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Location</h3>
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      Location not available
                    </div>
                  </div>
                )}
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
