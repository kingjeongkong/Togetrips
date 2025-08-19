import { ERROR_RULES } from './errorRules';
import { ErrorInfo } from './errorTypes';

const getDefaultErrorInfo = (): ErrorInfo => {
  return {
    title: 'An Error Occurred',
    description: 'An unexpected error occurred. Please try again later.',
    type: 'unknown',
    severity: 'high',
    solutions: [
      'Refresh the page',
      'Try again in a moment',
      'Contact administrator if the problem persists',
    ],
  };
};

export const ErrorService = {
  getErrorInfo(error: Error): ErrorInfo {
    // 규칙 순서대로 매칭 (첫 번째 매칭되는 규칙 사용)
    for (const rule of ERROR_RULES) {
      if (rule.pattern.test(error.message)) {
        const baseInfo = rule.getInfo(error);
        return {
          ...baseInfo,
          type: rule.type,
          severity: rule.severity,
        };
      }
    }

    // 매칭되는 규칙이 없으면 기본 에러 정보 반환 + 로깅
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔍 Unmatched error occurred! Need to add error rule:', {
        message: error.message,
        stack: error.stack?.split('\n')[0], // 첫 번째 스택 라인만
        timestamp: new Date().toISOString(),
      });
    }

    return getDefaultErrorInfo();
  },
};
