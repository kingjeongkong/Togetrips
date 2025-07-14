import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/home';

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`);
    const supabase = createServerSupabaseClient(request, response);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      return response;
    }
  }
  return NextResponse.redirect(`${origin}/auth/signin`);
}
