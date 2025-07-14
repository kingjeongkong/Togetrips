import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { NextRequest, NextResponse } from 'next/server';

// 브라우저용 Supabase 클라이언트 (Auth 포함)
export const createBrowserSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
};

// 서버 사이드용 Supabase 클라이언트 (SSR, 미들웨어에서 세션 인식)
export const createServerSupabaseClient = (request?: NextRequest, response?: NextResponse) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          if (!request || !request.cookies) {
            return [];
          }
          return request.cookies.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll: (cookies: { name: string; value: string; options?: any }[]) => {
          if (response) {
            cookies.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                ...options,
              });
            });
          }
          console.log('🔍 Setting cookies:', cookies);
        },
      },
    },
  );
};

// Supabase Storage 클라이언트 (서버 사이드)
export const createServerSupabaseStorageClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
};

// 기존 호환성을 위한 export (점진적 마이그레이션용)
export const supabase = createBrowserSupabaseClient();
