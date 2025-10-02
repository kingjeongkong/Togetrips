import { createClient } from '@supabase/supabase-js';
import { ServiceAccount } from 'firebase-admin';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { NextRequest, NextResponse } from 'next/server';

// Firebase Admin SDK 초기화
if (!getApps().length) {
  const firebaseConfig = {
    project_id: process.env.FIREBASE_PROJECT_ID!,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
    private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL!,
    client_id: process.env.FIREBASE_CLIENT_ID || '',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
  };

  initializeApp({
    credential: cert(firebaseConfig as ServiceAccount),
  });
}

// Supabase 관리자 클라이언트 (Service Role Key 사용)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  // 1. 내부 호출 인증 (DB 트리거만 이 API를 호출할 수 있도록 함)
  const authToken = request.headers.get('Authorization')?.split('Bearer ')[1];

  if (process.env.SUPABASE_FUNCTION_SECRET && authToken !== process.env.SUPABASE_FUNCTION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { receiverId, notificationPayload, type } = await request.json();

    if (!receiverId || !notificationPayload || !type) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 2. DB에서 사용자의 알림 설정 확인
    const { data: settings } = await supabaseAdmin
      .from('notification_settings')
      .select('push_enabled, chat_notifications, request_notifications')
      .eq('user_id', receiverId)
      .single();

    if (
      !settings ||
      !settings.push_enabled ||
      (type === 'chat' && !settings.chat_notifications) ||
      (type === 'request' && !settings.request_notifications)
    ) {
      return NextResponse.json({ message: 'Notification disabled' });
    }

    // 3. DB에서 사용자의 FCM 토큰 조회
    const { data: tokensData } = await supabaseAdmin
      .from('fcm_tokens')
      .select('token')
      .eq('user_id', receiverId);

    if (!tokensData || tokensData.length === 0) {
      return NextResponse.json({ message: 'No registered tokens found' });
    }

    const registrationTokens = tokensData.map((t) => t.token);

    // 4. FCM으로 알림 발송 (data payload만 사용하여 중복 방지)
    const uniqueId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now().toString();

    const message = {
      data: {
        title: notificationPayload.title,
        body: notificationPayload.body,
        url: notificationPayload.url,
        type: type,
        timestamp: timestamp,
        id: uniqueId,
        source: 'togetrips-api',
      },
      webpush: {
        fcmOptions: {
          link: notificationPayload.url,
        },
        headers: {
          TTL: '86400', // 24시간 TTL
        },
      },
      tokens: registrationTokens,
    };

    const response = await getMessaging().sendEachForMulticast(message);

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error('Error in /api/notifications/send:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
