import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import DataFetchErrorBoundary from '../components/ErrorBoundary/DataFetchErrorBoundary';

// Mock useSession
const mockUseSession = jest.fn();

// SessionProvider를 완전히 mock으로 대체
jest.mock('@/providers/SessionProvider', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSession: () => mockUseSession(),
}));

// Mock useSession을 외부에서 접근할 수 있도록 export
export { mockUseSession };

// 전역 QueryClient 인스턴스
let queryClient: QueryClient;

// QueryClient 초기화 함수
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
};

interface TestWrapperProps {
  children: React.ReactNode;
}

export function TestWrapper({ children }: TestWrapperProps): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <DataFetchErrorBoundary fallback={<p data-testid="error-fallback">문제가 발생했습니다</p>}>
        {children}
      </DataFetchErrorBoundary>
    </QueryClientProvider>
  );
}

// 테스트 설정 헬퍼 함수들
export const setupTestEnvironment = () => {
  queryClient = createQueryClient();
  mockSessionDefault();
};

export const cleanupTestEnvironment = () => {
  queryClient?.clear();
  jest.resetAllMocks();
};

export const mockSessionDefault = () => {
  mockUseSession.mockReturnValue({
    user: { id: 'test-user-id', email: 'test@example.com', name: 'Test User' },
    session: { access_token: 'test-token' },
    isLoading: false,
    isAuthenticated: true,
    userId: 'test-user-id',
  });
};

export const mockSessionNone = () => {
  mockUseSession.mockReturnValue({
    user: null,
    session: null,
    isLoading: false,
    isAuthenticated: false,
    userId: undefined,
  });
};

export const mockSessionCustom = (sessionData: {
  user: { id: string; email?: string; name?: string };
  session: { access_token: string };
  isLoading: boolean;
  isAuthenticated: boolean;
  userId?: string;
}) => {
  mockUseSession.mockReturnValue(sessionData);
};
