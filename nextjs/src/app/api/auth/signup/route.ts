import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json();

  try {
    const supabase = createServerSupabaseClient(request);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: name },
      email_confirm: true,
    });

    if (authError || !user) {
      throw new Error(authError?.message || 'Failed to create user');
    }

    const { error: profileError } = await supabase.from('users').insert({
      id: user.id,
      name,
      email,
      image: '',
      tags: '',
      bio: '',
      location_city: '',
      location_state: '',
    });

    if (profileError) {
      // 프로필 생성 실패 시 사용자도 삭제
      await supabase.auth.admin.deleteUser(user.id);
      throw new Error(profileError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 400 });
  }
}
