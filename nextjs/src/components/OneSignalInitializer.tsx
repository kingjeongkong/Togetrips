'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    OneSignalDeferred?: any[];
  }
}

const OneSignalInitializer = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // OneSignal SDK 로드
      const script = document.createElement('script');
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.defer = true;
      document.head.appendChild(script);

      // OneSignal 초기화
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.OneSignalDeferred.push(function (OneSignal: any) {
        OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
          notifyButton: {
            enable: false,
          },
          autoRegister: true,
          autoResubscribe: true,
        });
      });

      return () => {
        const existingScript = document.querySelector('script[src*="OneSignalSDK.page.js"]');
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
      };
    }
  }, []);

  return null;
};

export default OneSignalInitializer;
