'use client';

import DataFetchErrorBoundary from '@/components/ErrorBoundary/DataFetchErrorBoundary';
import GatheringDetail from '@/features/gatherings/components/GatheringDetail';
import { useParams, useRouter } from 'next/navigation';
import { HiArrowLeft } from 'react-icons/hi';

export default function GatheringDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gatheringId = params.id as string;

  const handleJoin = async () => {
    // TODO: 실제 API 호출로 교체 (다음 단계에서 구현)
    console.log('Join gathering:', gatheringId);
  };

  const handleLeave = async () => {
    // TODO: 실제 API 호출로 교체 (다음 단계에서 구현)
    console.log('Leave gathering:', gatheringId);
  };

  // Sticky 헤더 컴포넌트
  const StickyHeader = () => (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 md:h-16">
          <button
            onClick={() => router.push('/gatherings')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <HiArrowLeft className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyHeader />
      <div className="flex flex-col items-center w-full p-6 pb-20 md:pb-6">
        <div className="flex justify-center w-full">
          <DataFetchErrorBoundary>
            <GatheringDetail id={gatheringId} onJoin={handleJoin} onLeave={handleLeave} />
          </DataFetchErrorBoundary>
        </div>
      </div>
    </div>
  );
}
