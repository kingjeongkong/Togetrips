import { ErrorInfo, ErrorType } from './errorTypes';

export interface ErrorRule {
  pattern: RegExp;
  type: ErrorType;
  severity: 'low' | 'medium' | 'high';
  getInfo: (error: Error) => Omit<ErrorInfo, 'type' | 'severity'>;
}

export const ERROR_RULES: ErrorRule[] = [
  // 위치 서비스 관련 에러
  {
    pattern: /location|geolocation|position/i,
    type: 'location',
    severity: 'medium',
    getInfo: (error: Error) => {
      const message = error.message.toLowerCase();

      if (message.includes('permission') || message.includes('denied')) {
        return {
          title: 'Location Permission Required',
          description: 'Location access is needed to find nearby travelers.',
          solutions: [
            'Click the lock icon in the browser address bar',
            'Change "Location" permission to "Allow"',
            'Refresh the page',
          ],
        };
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
    getInfo: (error: Error) => ({
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
    getInfo: (error: Error) => ({
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
    getInfo: (error: Error) => ({
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
    getInfo: (error: Error) => ({
      title: 'Authentication Required',
      description: 'Login is required or session has expired.',
      solutions: ['Please log in again', 'Refresh the page', 'Clear browser cache'],
    }),
  },
];
