'use client';

import LoadingIndicator from '@/components/LoadingIndicator';
import MainProfile from '@/features/profile/components/MainProfile';
import { Suspense } from 'react';

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[400px] flex items-center justify-center">
          <LoadingIndicator color="#6366f1" size={50} />
        </div>
      }
    >
      <div className="w-full flex flex-col items-center p-6">
        <MainProfile />
      </div>
    </Suspense>
  );
}
