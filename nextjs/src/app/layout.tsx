import ClientProviders from '@/providers/ClientProviders';
import { Geist, Geist_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Togetrips - Find Your Travel Buddy',
  description: 'Discover travelers nearby and find your next companion with real-time chat.',
  applicationName: 'Togetrips',
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Togetrips',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-config': '/browserconfig.xml',
    'apple-touch-fullscreen': 'yes',
    'msapplication-tap-highlight': 'no',
  } as Record<string, string>,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
