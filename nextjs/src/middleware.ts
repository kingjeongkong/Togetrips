import { createServerSupabaseClient } from '@/lib/supabase-config';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  // 쿠키에서 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 보호된 경로들
  const protectedPaths = ['/home', '/profile', '/chat', '/request'];
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  // 인증이 필요한 경로인데 세션이 없으면 로그인 페이지로 리다이렉트
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // 이미 로그인된 사용자가 로그인/회원가입 페이지에 접근하면 홈으로 리다이렉트
  if (session && request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/home/:path*',
    '/request/:path*',
    '/profile/:path*',
    '/chat/:path*',
    '/api/users/:path*',
    '/api/profile/:path*',
    '/api/request/:path*',
    '/api/chat/:path*',
  ],
};
