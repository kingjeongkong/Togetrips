'use client';

import RequestCardList from '@/features/request/components/RequestCardList';

export default function RequestPage() {
  return (
    <main className="flex flex-col items-center w-full min-h-screen pb-10 bg-gray-100">
      <h1 className="text-3xl font-bold mb-2 text-center text-black">Travel Requests</h1>
      <p className="text-gray-500 text-lg mb-8 text-center">
        Review Travel Requests from other users.
      </p>
      <div className="flex justify-center w-full">
        <RequestCardList />
      </div>
    </main>
  );
}
