import { adminDb } from '@/lib/firebase-admin';
import { authOptions } from '@/lib/next-auth-config';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

interface LocationData {
  city: string;
  state: string;
}

interface ProfileUpdates {
  name?: string;
  bio?: string;
  tags?: string;
  location?: LocationData;
}

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

function validateLocation(location: LocationData): boolean {
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

    const updates: ProfileUpdates = await req.json();

    // 현재 사용자 데이터 가져오기
    const userRef = adminDb.collection('users').doc(currentUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentData = userDoc.data() as Record<string, unknown>;

    // 업데이트할 필드들 검증 및 변경사항 확인
    const validatedUpdates: Record<string, unknown> = {};
    let hasChanges = false;

    // 이름 검증 및 변경사항 확인
    if (updates.name !== undefined) {
      const sanitizedName = sanitizeText(updates.name);
      if (!validateName(sanitizedName)) {
        return NextResponse.json(
          { error: 'Name must be between 1 and 50 characters' },
          { status: 400 },
        );
      }

      // 이전 값과 비교
      if (currentData.name !== sanitizedName) {
        validatedUpdates.name = sanitizedName;
        hasChanges = true;
      }
    }

    // 자기소개 검증 및 변경사항 확인
    if (updates.bio !== undefined) {
      const sanitizedBio = sanitizeText(updates.bio);
      if (!validateBio(sanitizedBio)) {
        return NextResponse.json({ error: 'Bio must be 500 characters or less' }, { status: 400 });
      }

      // 이전 값과 비교
      if (currentData.bio !== sanitizedBio) {
        validatedUpdates.bio = sanitizedBio;
        hasChanges = true;
      }
    }

    // 태그 검증 및 변경사항 확인
    if (updates.tags !== undefined) {
      const sanitizedTags = sanitizeText(updates.tags);
      if (!validateTags(sanitizedTags)) {
        return NextResponse.json({ error: 'Tags must be 200 characters or less' }, { status: 400 });
      }

      // 이전 값과 비교
      if (currentData.tags !== sanitizedTags) {
        validatedUpdates.tags = sanitizedTags;
        hasChanges = true;
      }
    }

    // 위치 검증 및 변경사항 확인
    if (updates.location !== undefined) {
      if (!validateLocation(updates.location)) {
        return NextResponse.json({ error: 'Invalid location data' }, { status: 400 });
      }

      const sanitizedLocation = {
        city: sanitizeText(updates.location.city),
        state: sanitizeText(updates.location.state),
      };

      // 이전 값과 비교 (객체 비교)
      const currentLocation = currentData.location as LocationData | undefined;
      if (
        !currentLocation ||
        currentLocation.city !== sanitizedLocation.city ||
        currentLocation.state !== sanitizedLocation.state
      ) {
        validatedUpdates.location = sanitizedLocation;
        hasChanges = true;
      }
    }

    // 변경사항이 없으면 성공 응답 (업데이트 없음)
    if (!hasChanges) {
      return NextResponse.json({
        message: 'No changes detected. Profile is already up to date.',
        updatedFields: [],
        noChanges: true,
      });
    }

    // 업데이트 시간 추가
    validatedUpdates.updatedAt = new Date().toISOString();

    // 프로필 업데이트
    await userRef.update(validatedUpdates);

    return NextResponse.json({
      message: 'Profile updated successfully',
      updatedFields: Object.keys(validatedUpdates).filter((key) => key !== 'updatedAt'),
    });
  } catch (error: unknown) {
    // 에러 타입에 따른 적절한 에러 메시지 처리
    let errorMessage = 'Internal Server Error';

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    }

    console.error('Error updating profile:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
