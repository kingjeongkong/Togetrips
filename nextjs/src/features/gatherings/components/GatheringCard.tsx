import { formatCardDate } from '@/utils/dateUtils';
import Image from 'next/image';
import Link from 'next/link';
import { HiClock, HiLocationMarker } from 'react-icons/hi';
import { GatheringWithDetails } from '../types/gatheringTypes';

interface GatheringCardProps {
  gathering: GatheringWithDetails;
}

export default function GatheringCard({ gathering }: GatheringCardProps) {
  return (
    <Link href={`/gatherings/${gathering.id}`}>
      <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer transform hover:-translate-y-1">
        {/* 커버 이미지 */}
        {gathering.cover_image_url && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={gathering.cover_image_url}
              alt={gathering.activity_title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {/* 그라데이션 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        )}

        <div className="p-5">
          {/* 제목 */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300 leading-tight">
              {gathering.activity_title}
            </h3>
          </div>

          {/* 시간과 위치 */}
          <div className="space-y-3 mb-5">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <HiClock className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-medium">{formatCardDate(gathering.gathering_time)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <HiLocationMarker className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-medium">
                {gathering.city}, {gathering.country}
              </span>
            </div>
          </div>

          {/* 참여자 정보와 상태 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                {/* 참여자 아바타들 */}
                {gathering.participant_details?.slice(0, 4).map((participant) => (
                  <div
                    key={participant.id}
                    className="relative w-8 h-8 rounded-full overflow-hidden border-1 border-white shadow-md ring-1 ring-gray-100"
                  >
                    <Image
                      src={participant.image || '/default-traveler.png'}
                      alt={participant.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                {gathering.participant_count > 4 && (
                  <div className="z-10 w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-xs font-bold border-1 border-white shadow-md ring-1 ring-gray-100">
                    +{gathering.participant_count - 4}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-bold text-gray-900 text-base">
                  {gathering.participant_count}
                </span>
                <span className="text-gray-500">/{gathering.max_participants}</span>
              </div>
            </div>

            {/* 상태 표시 */}
            <div className="flex items-center">
              {gathering.is_full ? (
                <div className="flex items-center space-x-2 bg-red-50 px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs font-semibold text-red-700">Full</span>
                </div>
              ) : gathering.is_joined ? (
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-semibold text-green-700">Joined</span>
                </div>
              ) : gathering.is_host ? (
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-semibold text-blue-700">Host</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs font-semibold text-gray-600">Available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
