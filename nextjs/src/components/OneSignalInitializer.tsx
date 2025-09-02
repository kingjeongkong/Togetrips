'use client';

import { oneSignalClient } from '@/lib/onesignal/client';
import { useEffect } from 'react';

const OneSignalInitializer = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // OneSignal SDK 로드
      const script = document.createElement('script');
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.defer = true;
      document.head.appendChild(script);

      // OneSignal 초기화
      script.onload = async () => {
        try {
          await oneSignalClient.initialize();
          console.log('OneSignal 초기화 완료');
        } catch (error) {
          console.error('OneSignal 초기화 실패:', error);
        }
      };

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
