'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingIndicator from './LoadingIndicator';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 로딩 중이 아니고 세션이 없으면 로그인 페이지로 리다이렉트
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // 로딩 중일 때는 로딩 인디케이터 표시
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIndicator />
      </div>
    );
  }

  // 인증되지 않은 경우 아무것도 렌더링하지 않음 (리다이렉트 중)
  if (status === 'unauthenticated') {
    return null;
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
}
