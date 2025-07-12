import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// 브라우저용 Supabase 클라이언트 (Auth 포함)
export const createBrowserSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
};

// 서버 사이드용 Supabase 클라이언트 (Admin 권한)
export const createServerSupabaseClient = () => {
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

// 서버 사이드용 Supabase 클라이언트 (사용자 권한)
export const createServerSupabaseClientWithUser = (accessToken: string) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
