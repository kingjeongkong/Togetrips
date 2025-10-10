import { createServerSupabaseClient } from '@/lib/supabase-config';
import { NextRequest, NextResponse } from 'next/server';

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
    const currentUserId = user.id;

    // FormData 파싱
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const tags = formData.get('tags') as string;
    const imageFile = formData.get('image') as File | null;

    // 현재 사용자 데이터 가져오기
    const { data: currentUserData, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUserId)
      .single();

    if (fetchError || !currentUserData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 업데이트할 필드들 검증 및 변경사항 확인
    const validatedUpdates: Record<string, unknown> = {};
    let hasChanges = false;

    // 이름 검증 및 변경사항 확인
    if (name !== null) {
      const sanitizedName = sanitizeText(name);
      if (!validateName(sanitizedName)) {
        return NextResponse.json(
          { error: 'Name must be between 1 and 50 characters' },
          { status: 400 },
        );
      }
      if (currentUserData.name !== sanitizedName) {
        validatedUpdates.name = sanitizedName;
        hasChanges = true;
      }
    }

    // 자기소개 검증 및 변경사항 확인
    if (bio !== null) {
      const sanitizedBio = sanitizeText(bio);
      if (!validateBio(sanitizedBio)) {
        return NextResponse.json({ error: 'Bio must be 500 characters or less' }, { status: 400 });
      }
      if (currentUserData.bio !== sanitizedBio) {
        validatedUpdates.bio = sanitizedBio;
        hasChanges = true;
      }
    }

    // 태그 검증 및 변경사항 확인
    if (tags !== null) {
      const sanitizedTags = sanitizeText(tags);
      if (!validateTags(sanitizedTags)) {
        return NextResponse.json({ error: 'Tags must be 200 characters or less' }, { status: 400 });
      }
      if (currentUserData.tags !== sanitizedTags) {
        validatedUpdates.tags = sanitizedTags;
        hasChanges = true;
      }
    }

    // 이미지 파일이 있으면 업로드
    if (imageFile && imageFile.size > 0) {
      try {
        if (!imageFile.type.startsWith('image/')) {
          return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        }

        if (imageFile.size > 2 * 1024 * 1024) {
          return NextResponse.json({ error: 'File size too large' }, { status: 400 });
        }

        // 기존 이미지 URL 저장 (삭제용)
        const currentImageUrl = currentUserData.image;

        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${currentUserId}-${Date.now()}.${fileExt}`;
        const filePath = `profiles/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
        }

        const { data: urlData } = supabase.storage.from('profile-images').getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          validatedUpdates.image = urlData.publicUrl;
          hasChanges = true;

          // 기존 이미지가 있으면 삭제 (Supabase Storage 정리)
          if (currentImageUrl && currentImageUrl.includes('supabase.co')) {
            try {
              // URL에서 파일 경로 추출
              const urlParts = currentImageUrl.split('/');
              const oldFileName = urlParts.slice(-2).join('/'); // profiles/userId/filename

              const { error: deleteError } = await supabase.storage
                .from('profile-images')
                .remove([oldFileName]);

              if (deleteError) {
                console.warn('Failed to delete old profile image:', deleteError);
              } else {
                console.log(`Deleted old profile image: ${oldFileName}`);
              }
            } catch (deleteError) {
              // 삭제 실패는 로그만 남기고 계속 진행 (주요 기능에 영향 없음)
              console.warn('Failed to delete old profile image:', deleteError);
            }
          }
        }
      } catch (error) {
        console.error('Image upload error:', error);
        return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
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
    validatedUpdates.updated_at = new Date().toISOString();

    // 프로필 업데이트
    const { error: updateError } = await supabase
      .from('users')
      .update(validatedUpdates)
      .eq('id', currentUserId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // 업데이트된 사용자 데이터 가져오기
    const { data: updatedUserData, error: fetchUpdatedError } = await supabase
      .from('users')
      .select('name, bio, tags, image')
      .eq('id', currentUserId)
      .single();

    if (fetchUpdatedError || !updatedUserData) {
      console.error('Failed to fetch updated user data:', fetchUpdatedError);
      return NextResponse.json({ error: 'Failed to fetch updated profile' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      updatedFields: Object.keys(validatedUpdates).filter((key) => key !== 'updated_at'),
      profile: updatedUserData,
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
