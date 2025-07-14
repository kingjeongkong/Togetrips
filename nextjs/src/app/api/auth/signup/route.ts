import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json();

  try {
    const supabase = createServerSupabaseClient(request);

    // emailRedirectTo 설정
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const emailRedirectTo = `${siteUrl}/auth/callback`;

    // 일반 유저 회원가입
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo,
      },
    });

    if (signUpError) {
      throw new Error(signUpError.message || 'Failed to sign up');
    }

    if (!data.user) {
      throw new Error('No user data returned from signup');
    }

    console.log('User created:', data.user.id);

    // 프로필 생성 (upsert 방식으로 중복 방지)
    const { error: profileError } = await supabase.from('users').upsert(
      {
        id: data.user.id,
        name,
        email,
        image: '',
        tags: '',
        bio: '',
        location_city: '',
        location_state: '',
      },
      {
        onConflict: 'id',
      },
    );

    if (profileError) {
      throw new Error(profileError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 400 });
  }
}
