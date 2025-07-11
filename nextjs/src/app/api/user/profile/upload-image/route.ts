import { authOptions } from '@/lib/next-auth-config';
import {
  createServerSupabaseClient,
  createServerSupabaseStorageClient,
} from '@/lib/supabase-config';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// 파일 유효성 검사 함수들
function validateFileType(mimeType: string): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return allowedTypes.includes(mimeType);
}

function validateFileSize(size: number): boolean {
  const maxSize = 8 * 1024 * 1024; // 8MB
  return size > 0 && size <= maxSize;
}

function validateFileName(fileName: string): boolean {
  // 파일명 길이 제한
  if (fileName.length > 255) return false;

  // 위험한 문자 제거
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
  return !dangerousChars.test(fileName);
}

function validateImageDimensions(buffer: Buffer): Promise<boolean> {
  return new Promise((resolve) => {
    // 간단한 이미지 헤더 검사
    if (buffer.length < 8) {
      resolve(false);
      return;
    }

    // JPEG 시그니처 확인
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      resolve(true);
      return;
    }

    // PNG 시그니처 확인
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      resolve(true);
      return;
    }

    // WebP 시그니처 확인
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      if (buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
        resolve(true);
        return;
      }
    }

    resolve(false);
  });
}

// 파일명에서 한글, 공백, 특수문자 등 Supabase에서 허용하지 않는 문자를 _로 치환하는 함수
function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const currentUserId = session.user.id;

    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // 파일명 검증
    if (!validateFileName(file.name)) {
      return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
    }

    // 파일 타입 검증
    if (!validateFileType(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 },
      );
    }

    // 파일 크기 검증
    if (!validateFileSize(file.size)) {
      return NextResponse.json(
        { error: 'File size must be between 1 byte and 8MB' },
        { status: 400 },
      );
    }

    // 파일을 Buffer로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 이미지 헤더 검증 (실제 이미지 파일인지 확인)
    const isValidImage = await validateImageDimensions(buffer);
    if (!isValidImage) {
      return NextResponse.json({ error: 'Invalid image file format' }, { status: 400 });
    }

    // Supabase 클라이언트 초기화
    const supabase = createServerSupabaseClient();
    const supabaseStorage = createServerSupabaseStorageClient();

    // 1. 현재 사용자의 기존 프로필 이미지 URL 가져오기 (Supabase)
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('image')
      .eq('id', currentUserId)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      // PGRST116는 데이터가 없는 경우
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentImageUrl = currentUser?.image;

    // 2. Supabase Storage에 업로드
    const safeName = sanitizeFileName(file.name);
    const fileName = `profiles/${currentUserId}/${Date.now()}_${safeName}`;

    const { data: uploadData, error: uploadError } = await supabaseStorage.storage
      .from('profile-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        metadata: {
          uploadedBy: currentUserId,
          uploadedAt: new Date().toISOString(),
        },
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }

    // 3. 공개 URL 생성
    const { data: urlData } = supabaseStorage.storage.from('profile-images').getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // 4. 사용자 프로필에 이미지 URL 업데이트 (Supabase)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        image: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentUserId);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // 5. 기존 이미지가 있으면 삭제 (Supabase Storage 정리)
    if (currentImageUrl && currentImageUrl.includes('supabase.co')) {
      try {
        // URL에서 파일 경로 추출
        const urlParts = currentImageUrl.split('/');
        const oldFileName = urlParts.slice(-2).join('/'); // profiles/userId/filename

        const { error: deleteError } = await supabaseStorage.storage
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

    return NextResponse.json({
      message: 'Profile image uploaded successfully',
      imageUrl: publicUrl,
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
