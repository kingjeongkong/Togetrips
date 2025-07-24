'use client';

import Sidebar from '@/features/shared/components/Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar />
      <main className="flex-1 md:pl-60">
        <div className="h-full pt-16 md:pt-0 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
