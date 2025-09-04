import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request);

    // Supabase 세션 확인
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

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 사용자의 알림 설정 조회
    const { data: settings, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    // 설정이 없으면 기본값으로 생성
    if (!settings) {
      const { data: newSettings, error: createError } = await supabase
        .from('notification_settings')
        .insert({
          user_id: user.id,
          chat_notifications: true,
          request_notifications: true,
          push_enabled: true,
        })
        .select('*')
        .single();

      if (createError) {
        throw new Error(createError.message);
      }

      return NextResponse.json({
        success: true,
        data: newSettings,
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request);

    // Supabase 세션 확인
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

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chat_notifications, request_notifications, push_enabled } = await request.json();

    // 입력 검증
    if (typeof chat_notifications !== 'boolean' && chat_notifications !== undefined) {
      return NextResponse.json({ error: 'chat_notifications must be a boolean' }, { status: 400 });
    }

    if (typeof request_notifications !== 'boolean' && request_notifications !== undefined) {
      return NextResponse.json(
        { error: 'request_notifications must be a boolean' },
        { status: 400 },
      );
    }

    if (typeof push_enabled !== 'boolean' && push_enabled !== undefined) {
      return NextResponse.json({ error: 'push_enabled must be a boolean' }, { status: 400 });
    }

    // 업데이트할 필드만 구성
    const updateFields: Record<string, boolean> = {};
    if (chat_notifications !== undefined) {
      updateFields.chat_notifications = chat_notifications;
    }
    if (request_notifications !== undefined) {
      updateFields.request_notifications = request_notifications;
    }
    if (push_enabled !== undefined) {
      updateFields.push_enabled = push_enabled;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // 기존 설정이 있는지 확인
    const { data: existingSettings } = await supabase
      .from('notification_settings')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let result;
    if (existingSettings) {
      // 기존 설정 업데이트
      const { data, error } = await supabase
        .from('notification_settings')
        .update({
          ...updateFields,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select('*')
        .single();

      if (error) {
        throw new Error(error.message);
      }
      result = data;
    } else {
      // 새 설정 생성
      const { data, error } = await supabase
        .from('notification_settings')
        .insert({
          user_id: user.id,
          chat_notifications: chat_notifications ?? true,
          request_notifications: request_notifications ?? true,
          push_enabled: push_enabled ?? true,
        })
        .select('*')
        .single();

      if (error) {
        throw new Error(error.message);
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
