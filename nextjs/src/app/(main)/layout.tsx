'use client';

import { MapInitializer } from '@/components/MapInitializer';
import { MobileHeader } from '@/features/shared/components/MobileHeader';
import Sidebar from '@/features/shared/components/Sidebar';
import { Suspense } from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MapInitializer />

      <div className="min-h-[100dvh] md:min-h-screen bg-gray-100">
        <Suspense fallback={<div className="hidden md:block w-60 h-full bg-sky-200" />}>
          <Sidebar />
        </Suspense>

        <div className="md:pl-60">
          <MobileHeader />
          <main>{children}</main>
        </div>
      </div>
    </>
  );
}
