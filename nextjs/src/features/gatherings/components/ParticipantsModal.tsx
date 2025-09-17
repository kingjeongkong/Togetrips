import Image from 'next/image';
import { HiX } from 'react-icons/hi';
import { GatheringWithDetails } from '../types/gatheringTypes';

interface ParticipantsModalProps {
  gathering: GatheringWithDetails;
  isOpen: boolean;
  onClose: () => void;
}

export default function ParticipantsModal({ gathering, isOpen, onClose }: ParticipantsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* 모달 컨테이너 */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Participants ({gathering.participant_count})
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
          >
            <HiX className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* 참여자 목록 */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {gathering.participant_details && gathering.participant_count > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gathering.participant_details.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors duration-200 group"
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-3 border-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Image
                      src={participant.image || '/default-traveler.png'}
                      alt={participant.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{participant.name}</p>
                    {participant.id === gathering.host_id && (
                      <span className="inline-block text-xs text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded-full mt-1">
                        Host
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiX className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No participants yet</p>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {gathering.participant_count} of {gathering.max_participants} participants
            </span>
            <span>{gathering.max_participants - gathering.participant_count} spots remaining</span>
          </div>
        </div>
      </div>
    </div>
  );
}
