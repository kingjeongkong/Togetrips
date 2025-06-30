import { adminDb } from '@/lib/firebase-admin';
import { authOptions } from '@/lib/next-auth-config';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const currentUserId = session.user.id;

    const updates = await req.json();

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
      if (currentData.tags !== sanitizedTags) {
        validatedUpdates.tags = sanitizedTags;
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
  } catch (error) {
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

function validateName(name: string): boolean {
  return name.length >= 1 && name.length <= 50;
}

function validateBio(bio: string): boolean {
  return bio.length <= 500;
}

function validateTags(tags: string): boolean {
  return tags.length <= 200;
}

function sanitizeText(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(
      /<(iframe|object|embed|form|input|textarea|select|button|link|meta|style|title|head|body|html)[^>]*>/gi,
      '',
    )
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/\$\{.*\}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
