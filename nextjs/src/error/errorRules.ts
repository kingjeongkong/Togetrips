import { ErrorInfo, ErrorType } from './errorTypes';

export interface ErrorRule {
  pattern: RegExp;
  type: ErrorType;
  severity: 'low' | 'medium' | 'high';
  getInfo: (error?: Error) => Omit<ErrorInfo, 'type' | 'severity'>;
}

export const ERROR_RULES: ErrorRule[] = [
  // 위치 서비스 관련 에러
  {
    pattern: /location|geolocation|position/i,
    type: 'location',
    severity: 'medium',
    getInfo: (error?: Error) => {
      const message = error?.message?.toLowerCase() || '';

      if (message.includes('permission') || message.includes('denied')) {
        // 에러 메시지에서 PWA 정보 파싱
        const isPWA = message.includes('PWA: true');

        if (isPWA) {
          return {
            title: 'Location Permission Required (PWA)',
            description:
              'Location access is needed to find nearby travelers. Please enable location permission.',
            solutions: [
              '1. Delete the app from your home screen',
              '2. Reinstall the app from your browser',
              '3. Allow location permission when prompted',
            ],
          };
        } else {
          return {
            title: 'Location Permission Required (Web)',
            description:
              'Location access is needed to find nearby travelers. Please enable location permission in your browser.',
            solutions: [
              '1. Click the lock icon in the browser address bar',
              '2. Change "Location" permission to "Allow"',
              '3. Refresh the page after enabling permission',
              'Try a different browser if the issue persists',
            ],
          };
        }
      }

      if (message.includes('timeout') || message.includes('expired')) {
        return {
          title: 'Location Service Timeout',
          description: 'Network connection may be unstable or GPS signal is weak.',
          solutions: [
            'Try outdoors where GPS signal is stronger',
            'Switch to mobile data',
            'Try again in a moment',
          ],
        };
      }

      if (message.includes('network') || message.includes('unavailable')) {
        return {
          title: 'Location Service Unavailable',
          description: 'Location services may be restricted on public WiFi.',
          solutions: [
            'Switch to mobile data',
            'Try a different network environment',
            'Try outdoors where GPS signal is stronger',
          ],
        };
      }

      return {
        title: 'Unable to Get Location',
        description: 'There was a temporary issue with location services.',
        solutions: ['Refresh the page', 'Try again in a moment', 'Try a different browser'],
      };
    },
  },

  // 권한 관련 에러
  {
    pattern: /permission|denied|unauthorized/i,
    type: 'permission',
    severity: 'medium',
    getInfo: () => ({
      title: 'Permission Required',
      description: 'Permission is required to use this feature.',
      solutions: [
        'Allow permission in browser settings',
        'Refresh the page',
        'Try a different browser',
      ],
    }),
  },

  // 네트워크 관련 에러
  {
    pattern: /network|connection|fetch|request/i,
    type: 'network',
    severity: 'medium',
    getInfo: () => ({
      title: 'Network Connection Issue',
      description: 'There is a problem with network connection.',
      solutions: [
        'Check your internet connection',
        'Switch to a different network',
        'Try again in a moment',
      ],
    }),
  },

  // 타임아웃 관련 에러
  {
    pattern: /timeout|expired|timed out/i,
    type: 'timeout',
    severity: 'low',
    getInfo: () => ({
      title: 'Request Timeout',
      description: 'Request processing time has exceeded.',
      solutions: ['Check your network connection', 'Try again in a moment', 'Refresh the page'],
    }),
  },

  // 인증 관련 에러
  {
    pattern: /auth|login|session|token/i,
    type: 'auth',
    severity: 'high',
    getInfo: () => ({
      title: 'Authentication Required',
      description: 'Login is required or session has expired.',
      solutions: ['Please log in again', 'Refresh the page', 'Clear browser cache'],
    }),
  },
];
