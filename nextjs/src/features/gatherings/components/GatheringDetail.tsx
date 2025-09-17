import { formatDetailDate, formatTime } from '@/utils/dateUtils';
import Image from 'next/image';
import { useState } from 'react';
import { HiCalendar, HiClock, HiLocationMarker, HiUsers } from 'react-icons/hi';
import { GatheringWithDetails } from '../types/gatheringTypes';
import JoinButton from './JoinButton';
import ParticipantsModal from './ParticipantsModal';

interface GatheringDetailProps {
  gathering: GatheringWithDetails;
  onJoin?: () => void;
  onLeave?: () => void;
  isLoading?: boolean;
}

export default function GatheringDetail({
  gathering,
  onJoin,
  onLeave,
  isLoading = false,
}: GatheringDetailProps) {
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* Cover Image */}
      {gathering.cover_image_url && (
        <div className="relative h-64 sm:h-80 w-full">
          <Image
            src={gathering.cover_image_url}
            alt={gathering.activity_title}
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
              {gathering.activity_title}
            </h1>

            {gathering.host && (
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-3 border-white shadow-lg">
                  <Image
                    src={gathering.host.image || '/default-traveler.png'}
                    alt={gathering.host.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Hosted by</p>
                  <p className="font-bold text-gray-900 text-lg">{gathering.host.name}</p>
                </div>
              </div>
            )}
          </div>

          <JoinButton
            isHost={gathering.is_host}
            isJoined={gathering.is_joined}
            isFull={gathering.is_full}
            isLoading={isLoading}
            onJoin={onJoin}
            onLeave={onLeave}
            className="w-full sm:w-auto sm:min-w-[160px] sm:h-14 sm:text-lg sm:font-bold"
          />
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
                {gathering.description}
              </p>
            </div>

            {/* Participants */}
            {gathering.participant_details && gathering.participant_count > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <HiUsers className="w-5 h-5 text-blue-600" />
                    </div>
                    Participants ({gathering.participant_count})
                  </h2>
                  {gathering.participant_count > 4 && (
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
                  {gathering.participant_details.slice(0, 4).map((participant) => (
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
                      {participant.id === gathering.host_id && (
                        <span className="text-xs text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded-full mt-1">
                          Host
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {gathering.participant_count > 4 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setShowParticipantsModal(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      +{gathering.participant_count - 4} more participants
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
                  <span className="text-sm">{formatDetailDate(gathering.gathering_time)}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <HiClock className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-sm">{formatTime(gathering.gathering_time)}</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
              <div className="flex items-start text-gray-700">
                <HiLocationMarker className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">{gathering.city}</p>
                  <p className="text-sm text-gray-600">{gathering.country}</p>
                </div>
              </div>
            </div>

            {/* Participants Count */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Participants</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  {gathering.participant_count}
                </span>
                <span className="text-gray-600">/ {gathering.max_participants}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(gathering.participant_count / gathering.max_participants) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Participants Modal */}
      <ParticipantsModal
        gathering={gathering}
        isOpen={showParticipantsModal}
        onClose={() => setShowParticipantsModal(false)}
      />
    </div>
  );
}
