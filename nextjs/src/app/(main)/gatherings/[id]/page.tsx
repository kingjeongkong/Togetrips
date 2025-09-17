'use client';

import GatheringDetail from '@/features/gatherings/components/GatheringDetail';
import { mockGatherings } from '@/features/gatherings/data/mockData';
import { GatheringWithDetails } from '@/features/gatherings/types/gatheringTypes';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HiArrowLeft } from 'react-icons/hi';

export default function GatheringDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [gathering, setGathering] = useState<GatheringWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    // TODO: 실제 API 호출로 교체
    const fetchGathering = async () => {
      setIsLoading(true);
      setTimeout(() => {
        const foundGathering = mockGatherings.find((g) => g.id === params.id);
        setGathering(foundGathering || null);
        setIsLoading(false);
      }, 500);
    };

    if (params.id) {
      fetchGathering();
    }
  }, [params.id]);

  const handleJoin = async () => {
    if (!gathering) return;

    setIsActionLoading(true);
    // TODO: 실제 API 호출로 교체
    setTimeout(() => {
      setGathering((prev) =>
        prev
          ? {
              ...prev,
              is_joined: true,
              participant_count: prev.participant_count + 1,
              participants: [...prev.participants, 'current-user-id'],
              participant_details: [
                ...(prev.participant_details || []),
                {
                  id: 'current-user-id',
                  name: 'Current User',
                  image:
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
                },
              ],
            }
          : null,
      );
      setIsActionLoading(false);
    }, 1000);
  };

  const handleLeave = async () => {
    if (!gathering) return;

    setIsActionLoading(true);
    // TODO: 실제 API 호출로 교체
    setTimeout(() => {
      setGathering((prev) =>
        prev
          ? {
              ...prev,
              is_joined: false,
              participant_count: prev.participant_count - 1,
              participants: prev.participants.filter((id) => id !== 'current-user-id'),
              participant_details: (prev.participant_details || []).filter(
                (p) => p.id !== 'current-user-id',
              ),
            }
          : null,
      );
      setIsActionLoading(false);
    }, 1000);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StickyHeader />
        <div className="flex flex-col items-center w-full p-6 pb-20 md:pb-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading gathering details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!gathering) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StickyHeader />
        <div className="flex flex-col items-center w-full p-6 pb-20 md:pb-6">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Gathering Not Found</h1>
            <p className="text-gray-600 mb-8">
              The gathering you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => router.push('/gatherings')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <HiArrowLeft className="w-4 h-4 mr-2" />
              Back to Gatherings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyHeader />
      <div className="flex flex-col items-center w-full p-6 pb-20 md:pb-6">
        <div className="flex justify-center w-full">
          <GatheringDetail
            gathering={gathering}
            onJoin={handleJoin}
            onLeave={handleLeave}
            isLoading={isActionLoading}
          />
        </div>
      </div>
    </div>
  );
}
