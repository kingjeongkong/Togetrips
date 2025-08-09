'use client';

import { MapInitializer } from '@/components/MapInitializer';
import Sidebar from '@/features/shared/components/Sidebar';
import { Suspense } from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MapInitializer />
      <div className="flex min-h-[100dvh] md:min-h-screen bg-gray-100">
        <Suspense fallback={<div className="w-60 bg-sky-200" />}>
          <Sidebar />
        </Suspense>
        <main className="flex-1 md:pl-60">
          <div className="pt-16 md:pt-0">{children}</div>
        </main>
      </div>
    </>
  );
}
