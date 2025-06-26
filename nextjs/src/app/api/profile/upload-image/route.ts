import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { authOptions } from '@/lib/next-auth-config';
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

    // 1. 현재 사용자의 기존 프로필 이미지 URL 가져오기
    const userRef = adminDb.collection('users').doc(currentUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentData = userDoc.data();
    const currentImageUrl = currentData?.image;

    // 2. 이미지 변경사항 확인 (파일 해시 비교)
    const fileHash = await calculateFileHash(buffer);
    const currentImageHash = currentData?.imageHash;

    // 같은 해시값이면 이미지가 동일함
    if (currentImageHash && currentImageHash === fileHash) {
      return NextResponse.json({
        message: 'Image is identical to current profile image. No upload needed.',
        imageUrl: currentImageUrl,
        noChanges: true,
      });
    }

    // 3. Firebase Storage에 업로드
    const bucket = adminStorage.bucket();
    const fileName = `profiles/${currentUserId}/${Date.now()}_${file.name}`;
    const fileUpload = bucket.file(fileName);

    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          uploadedBy: currentUserId,
          uploadedAt: new Date().toISOString(),
          fileHash: fileHash, // 파일 해시 저장
        },
      },
    });

    // 4. 영구 공개 URL 생성
    await fileUpload.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    // 5. 사용자 프로필에 이미지 URL과 해시 업데이트
    await userRef.update({
      image: publicUrl,
      imageHash: fileHash, // 파일 해시 저장
      updatedAt: new Date().toISOString(),
    });

    // 6. 기존 이미지가 있으면 삭제 (스토리지 정리)
    if (currentImageUrl && currentImageUrl.includes('storage.googleapis.com')) {
      try {
        // URL에서 파일 경로 추출
        const urlParts = currentImageUrl.split('/');
        const oldFileName = urlParts.slice(-2).join('/'); // profiles/userId/filename
        const oldFile = bucket.file(oldFileName);

        // 파일이 존재하는지 확인 후 삭제
        const [exists] = await oldFile.exists();
        if (exists) {
          await oldFile.delete();
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

// 파일 해시 계산 함수 (간단한 해시)
async function calculateFileHash(buffer: Buffer): Promise<string> {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(buffer).digest('hex');
}
