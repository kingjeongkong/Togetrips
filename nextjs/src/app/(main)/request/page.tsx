'use client';

import RequestCardList from '@/features/request/components/RequestCardList';

export default function RequestPage() {
  return (
    <div className="flex flex-col items-center w-full p-6">
      <h1 className="text-3xl font-bold mb-2 text-center text-black">Travel Requests</h1>
      <p className="text-gray-500 text-lg mb-8 text-center">
        Review Travel Requests from other users.
      </p>
      <div className="flex justify-center w-full">
        <RequestCardList />
      </div>
    </div>
  );
}
