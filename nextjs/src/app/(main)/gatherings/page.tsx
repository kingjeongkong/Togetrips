'use client';

import CreateGatheringForm from '@/features/gatherings/components/CreateGatheringForm';
import GatheringList from '@/features/gatherings/components/GatheringList';
import { mockGatherings } from '@/features/gatherings/data/mockData';
import { CreateGatheringRequest } from '@/features/gatherings/types/gatheringTypes';
import { useState } from 'react';
import { HiPlus } from 'react-icons/hi';

export default function GatheringsPage() {
  const [gatherings, setGatherings] = useState(mockGatherings);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateGathering = async (data: CreateGatheringRequest) => {
    setIsLoading(true);
    // TODO: 실제 API 호출로 교체
    setTimeout(() => {
      const newGathering = {
        id: `gathering-${Date.now()}`,
        host_id: 'current-user-id',
        ...data,
        participants: ['current-user-id'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        host: {
          id: 'current-user-id',
          name: 'Current User',
          image:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        },
        participant_count: 1,
        is_joined: false,
        is_host: true,
        is_full: false,
        participant_details: [
          {
            id: 'current-user-id',
            name: 'Current User',
            image:
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          },
        ],
      };

      setGatherings((prev) => [newGathering, ...prev]);
      setShowCreateForm(false);
      setIsLoading(false);
    }, 1000);
  };

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <CreateGatheringForm
            onSubmit={handleCreateGathering}
            isLoading={isLoading}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full p-6 pb-20 md:pb-6">
      <h1 className="text-3xl font-bold mb-2 text-center text-black">Gatherings</h1>
      <p className="text-gray-500 text-lg mb-8 text-center">
        Discover and join local activities in your area
      </p>
      <div className="flex justify-center w-full">
        <GatheringList gatherings={gatherings} isLoading={isLoading} />
      </div>

      {/* Floating Create Button */}
      <button
        onClick={() => setShowCreateForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-50 flex items-center justify-center"
      >
        <HiPlus className="w-6 h-6" />
      </button>
    </div>
  );
}
