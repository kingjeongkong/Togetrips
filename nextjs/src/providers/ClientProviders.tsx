'use client';

import { AppInitializer } from '@/components/AppInitializer';
import NotificationPermissionBanner from '@/components/NotificationPermissionBanner';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';
import { SessionProvider } from '@/providers/SessionProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/next';
import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <AppInitializer />
        <NotificationPermissionBanner />
        <PwaInstallPrompt />
        {children}
        <Analytics />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={true}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </SessionProvider>
    </QueryClientProvider>
  );
}
