import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, provider, isEnabled } = await request.json();

    if (!userId || !provider || typeof isEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: userId, provider, isEnabled' },
        { status: 400 },
      );
    }

    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // .upsert()를 사용하여 생성과 업데이트를 한번에 처리
    const { error } = await supabase.from('push_notification_subscriptions').upsert(
      {
        user_id: userId,
        provider: provider,
        is_enabled: isEnabled,
        updated_at: new Date().toISOString(),
      },
      {
        // user_id와 provider가 일치하는 행이 있으면 UPDATE, 없으면 INSERT
        onConflict: 'user_id, provider',
      },
    );

    if (error) {
      // UNIQUE 제약 조건 위반이 아닌 다른 에러일 경우
      if (error.code !== '23505') {
        throw new Error(error.message);
      }
    }

    const message = isEnabled
      ? 'Subscription enabled successfully'
      : 'Subscription disabled successfully';
    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
