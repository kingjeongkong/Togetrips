'use client';

import { SessionProvider } from '@/providers/SessionProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Geist, Geist_Mono } from 'next/font/google';
import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <html lang="en">
      <head>
        <title>Togetrips - Find Your Travel Buddy</title>
        <meta
          name="description"
          content="Discover travelers nearby and find your next companion with real-time chat."
        />
        <link rel="icon" type="image/png" sizes="32x32" href="/togetrips-logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/togetrips-logo.png" />
        <link rel="shortcut icon" href="/togetrips-logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/togetrips-logo.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/togetrips-logo.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/togetrips-logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Togetrips" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#f97316" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            {children}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </SessionProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
