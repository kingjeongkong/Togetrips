import { adminDb } from '@/lib/firebase-admin';
import { authOptions } from '@/lib/next-auth-config';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// 기본 유효성 검사 함수들 (길이, 타입, 필수값)
function validateName(name: string): boolean {
  return name.length >= 1 && name.length <= 50;
}

function validateBio(bio: string): boolean {
  return bio.length <= 500;
}

function validateTags(tags: string): boolean {
  return tags.length <= 200;
}

function validateLocation(location: any): boolean {
  if (!location) return false;

  // 타입 검사
  if (typeof location.city !== 'string' || typeof location.state !== 'string') {
    return false;
  }

  // 길이 검사
  if (location.city.length > 100 || location.state.length > 100) {
    return false;
  }

  // 빈 문자열 방지
  if (location.city.trim().length === 0 || location.state.trim().length === 0) {
    return false;
  }

  return true;
}

// 강화된 XSS 방지 (위험한 패턴 처리)
function sanitizeText(text: string): string {
  return (
    text
      // 스크립트 태그 완전 제거
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // 위험한 HTML 태그들 제거
      .replace(
        /<(iframe|object|embed|form|input|textarea|select|button|link|meta|style|title|head|body|html)[^>]*>/gi,
        '',
      )
      // 이벤트 핸들러 제거
      .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
      // javascript: 프로토콜 제거
      .replace(/javascript:/gi, '')
      // data URL 제거
      .replace(/data:text\/html/gi, '')
      // 템플릿 리터럴 주입 방지
      .replace(/\$\{.*\}/g, '')
      // 연속된 공백 정리
      .replace(/\s+/g, ' ')
      .trim()
  );
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const currentUserId = session.user.id;

    const updates = await req.json();

    // 업데이트할 필드들 검증
    const validatedUpdates: any = {};

    // 이름 검증
    if (updates.name !== undefined) {
      const sanitizedName = sanitizeText(updates.name);
      if (!validateName(sanitizedName)) {
        return NextResponse.json(
          { error: 'Name must be between 1 and 50 characters' },
          { status: 400 },
        );
      }
      validatedUpdates.name = sanitizedName;
    }

    // 자기소개 검증
    if (updates.bio !== undefined) {
      const sanitizedBio = sanitizeText(updates.bio);
      if (!validateBio(sanitizedBio)) {
        return NextResponse.json({ error: 'Bio must be 500 characters or less' }, { status: 400 });
      }
      validatedUpdates.bio = sanitizedBio;
    }

    // 태그 검증
    if (updates.tags !== undefined) {
      const sanitizedTags = sanitizeText(updates.tags);
      if (!validateTags(sanitizedTags)) {
        return NextResponse.json({ error: 'Tags must be 200 characters or less' }, { status: 400 });
      }
      validatedUpdates.tags = sanitizedTags;
    }

    // 위치 검증
    if (updates.location !== undefined) {
      if (!validateLocation(updates.location)) {
        return NextResponse.json({ error: 'Invalid location data' }, { status: 400 });
      }
      validatedUpdates.location = {
        city: sanitizeText(updates.location.city),
        state: sanitizeText(updates.location.state),
      };
    }

    // 업데이트할 내용이 없으면 에러
    if (Object.keys(validatedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // 업데이트 시간 추가
    validatedUpdates.updatedAt = new Date().toISOString();

    // 프로필 업데이트
    const userRef = adminDb.collection('users').doc(currentUserId);
    await userRef.update(validatedUpdates);

    return NextResponse.json({
      message: 'Profile updated successfully',
      updatedFields: Object.keys(validatedUpdates),
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
