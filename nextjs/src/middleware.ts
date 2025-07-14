import { createServerSupabaseClient } from '@/lib/supabase-config';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabase = createServerSupabaseClient(request);

  // 쿠키에서 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let user = null;
  if (session?.access_token) {
    const { data, error } = await supabase.auth.getUser(session.access_token);
    if (!error) {
      user = data.user;
    }
  }

  // 루트 경로 처리
  if (request.nextUrl.pathname === '/') {
    if (user) {
      return NextResponse.redirect(new URL('/home', request.url));
    } else {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  // OAuth 콜백 경로는 인증 체크 제외
  if (request.nextUrl.pathname === '/auth/callback') {
    return NextResponse.next();
  }

  // 보호된 경로들
  const protectedPaths = ['/home', '/profile', '/chat', '/request'];
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  // 인증이 필요한 경로인데 user가 없으면 로그인 페이지로 리다이렉트
  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // 이미 로그인된 사용자가 로그인/회원가입 페이지에 접근하면 홈으로 리다이렉트
  if (user && request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/home/:path*',
    '/request/:path*',
    '/profile/:path*',
    '/chat/:path*',
    '/auth/:path*',
    '/api/users/:path*',
    '/api/profile/:path*',
    '/api/request/:path*',
    '/api/chat/:path*',
  ],
};
