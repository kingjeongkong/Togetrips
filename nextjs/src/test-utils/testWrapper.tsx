import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import React from 'react';

// Mock useSession
const mockUseSession = jest.fn();
jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
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
  session?: Session | null;
}

export function TestWrapper({
  children,
  session = { user: { id: 'test-user-id' } } as Session,
}: TestWrapperProps): React.ReactElement {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
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
  mockUseSession.mockReturnValue({ data: { user: { id: 'test-user-id' } } as Session });
};

export const mockSessionNone = () => {
  mockUseSession.mockReturnValue({ data: null });
};

export const mockSessionCustom = (sessionData: Session) => {
  mockUseSession.mockReturnValue({ data: sessionData });
};
