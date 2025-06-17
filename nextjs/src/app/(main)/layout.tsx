'use client';

import Sidebar from '@/features/shared/components/Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <main className="flex-1 w-full min-h-screen bg-gray-100 pt-16 md:pt-5 md:pl-60">
        {children}
      </main>
    </div>
  );
}
