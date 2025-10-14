import LoadingIndicator from '@/components/LoadingIndicator';
import { formatDetailDate, formatTime } from '@/utils/dateUtils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { HiCalendar, HiClock, HiLocationMarker, HiUsers } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { useGatheringDetail, useJoinGathering, useLeaveGathering } from '../hooks/useGathering';
import EditButton from './EditButton';
import JoinChatButton from './JoinChatButton';
import LeaveDeleteButton from './LeaveDeleteButton';
import ParticipantsModal from './ParticipantsModal';

export default function GatheringDetail({ gatheringId }: { gatheringId: string }) {
  const { gatheringDetail, isDetailLoading } = useGatheringDetail(gatheringId);
  const { joinGathering, isJoining } = useJoinGathering(gatheringId);
  const { leaveGathering, isLeaving } = useLeaveGathering(gatheringId);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const router = useRouter();

  // 채팅방 보기 핸들러
  const handleViewChat = () => {
    if (!gatheringDetail) return;

    if (gatheringDetail.chat_room_id) {
      router.push(`/chat/${gatheringDetail.chat_room_id}?type=group`);
    } else {
      console.error('Chat room not found for this gathering');
      toast.error('Chat room not found');
    }
  };

  // 모임 수정 핸들러
  const handleEdit = () => {
    // TODO: 모임 수정 로직 구현
    console.log('Edit gathering:', gatheringId);
  };

  // 모임 삭제 핸들러
  const handleDelete = () => {
    // TODO: 모임 삭제 로직 구현
    const confirmed = window.confirm(
      'Are you sure you want to delete this gathering? This action cannot be undone and will delete the chat room as well.',
    );
    if (confirmed) {
      console.log('Delete gathering:', gatheringId);
    }
  };

  // 로딩 상태 처리
  if (isDetailLoading) {
    return <LoadingIndicator color="#6366f1" size={50} />;
  }

  // 데이터가 없는 경우
  if (!gatheringDetail) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Gathering Not Found</h1>
          <p className="text-gray-600">
            The gathering you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* Cover Image */}
      {gatheringDetail.cover_image_url && (
        <div className="relative h-64 sm:h-80 w-full">
          <Image
            src={gatheringDetail.cover_image_url}
            alt={gatheringDetail.activity_title}
            fill
            className="object-cover"
          />
          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        </div>
      )}

      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {gatheringDetail.activity_title}
            </h1>

            {gatheringDetail.host && (
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-3 border-white shadow-lg">
                  <Image
                    src={gatheringDetail.host.image || '/default-traveler.png'}
                    alt={gatheringDetail.host.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Hosted by</p>
                  <p className="font-bold text-gray-900 text-lg">{gatheringDetail.host.name}</p>
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:block">
            <div className="flex items-center gap-2 mb-4">
              <JoinChatButton
                isJoined={gatheringDetail.is_joined}
                isFull={gatheringDetail.is_full}
                isLoading={isJoining}
                onJoin={() => joinGathering()}
                onViewChat={() => handleViewChat()}
                className="flex-1"
              />
              <EditButton isHost={gatheringDetail.is_host} onEdit={() => handleEdit()} />
            </div>
            <div className="flex justify-center">
              <LeaveDeleteButton
                isHost={gatheringDetail.is_host}
                isJoined={gatheringDetail.is_joined}
                isLoading={isLeaving}
                onLeave={() => leaveGathering()}
                onDelete={() => handleDelete()}
              />
            </div>
          </div>

          {/* Mobile: 상단/하단 분리 */}
          <div className="block sm:hidden">
            {/* 상단: Join/View Chat + Edit */}
            <div className="flex items-center gap-3 mb-4">
              <JoinChatButton
                isJoined={gatheringDetail.is_joined}
                isFull={gatheringDetail.is_full}
                isLoading={isJoining}
                onJoin={() => joinGathering()}
                onViewChat={() => handleViewChat()}
                className="flex-1"
              />
              <EditButton isHost={gatheringDetail.is_host} onEdit={() => handleEdit()} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <HiUsers className="w-5 h-5 text-purple-600" />
                </div>
                About this gathering
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                {gatheringDetail.description}
              </p>
            </div>

            {/* Participants */}
            {gatheringDetail.participant_details && gatheringDetail.participant_count > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <HiUsers className="w-5 h-5 text-blue-600" />
                    </div>
                    Participants ({gatheringDetail.participant_count})
                  </h2>
                  {gatheringDetail.participant_count > 4 && (
                    <button
                      onClick={() => setShowParticipantsModal(true)}
                      className="inline-flex items-center px-4 py-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-xl transition-all duration-200"
                    >
                      <HiUsers className="w-4 h-4 mr-2" />
                      View All
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {gatheringDetail.participant_details.slice(0, 4).map((participant) => (
                    <div
                      key={participant.id}
                      className="flex flex-col items-center text-center group"
                    >
                      <div className="relative w-16 h-16 rounded-full overflow-hidden mb-3 border-3 border-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <Image
                          src={participant.image || '/default-traveler.png'}
                          alt={participant.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-sm font-bold text-gray-900 truncate w-full">
                        {participant.name}
                      </p>
                      {participant.id === gatheringDetail.host_id && (
                        <span className="text-xs text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded-full mt-1">
                          Host
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {gatheringDetail.participant_count > 4 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setShowParticipantsModal(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      +{gatheringDetail.participant_count - 4} more participants
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Date & Time */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Date & Time</h3>
              <div className="space-y-2">
                <div className="flex items-center text-gray-700">
                  <HiCalendar className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-sm">
                    {formatDetailDate(gatheringDetail.gathering_time)}
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <HiClock className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-sm">{formatTime(gatheringDetail.gathering_time)}</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
              <div className="flex items-start text-gray-700">
                <HiLocationMarker className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">{gatheringDetail.city}</p>
                  <p className="text-sm text-gray-600">{gatheringDetail.country}</p>
                </div>
              </div>
            </div>

            {/* Participants Count */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Participants</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  {gatheringDetail.participant_count}
                </span>
                <span className="text-gray-600">/ {gatheringDetail.max_participants}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(gatheringDetail.participant_count / gatheringDetail.max_participants) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Mobile: LeaveDeleteButton */}
            <div className="block sm:hidden">
              <LeaveDeleteButton
                isHost={gatheringDetail.is_host}
                isJoined={gatheringDetail.is_joined}
                isLoading={isLeaving}
                onLeave={() => leaveGathering()}
                onDelete={() => handleDelete()}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Participants Modal */}
      <ParticipantsModal
        gathering={gatheringDetail}
        isOpen={showParticipantsModal}
        onClose={() => setShowParticipantsModal(false)}
      />
    </div>
  );
}
