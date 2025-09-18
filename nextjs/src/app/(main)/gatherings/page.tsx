'use client';

import DataFetchErrorBoundary from '@/components/ErrorBoundary/DataFetchErrorBoundary';
import CreateGatheringForm from '@/features/gatherings/components/CreateGatheringForm';
import GatheringList from '@/features/gatherings/components/GatheringList';
import { useState } from 'react';
import { HiPlus } from 'react-icons/hi';

export default function GatheringsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <CreateGatheringForm onClose={() => setShowCreateForm(false)} />
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
        <DataFetchErrorBoundary>
          <GatheringList />
        </DataFetchErrorBoundary>
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
