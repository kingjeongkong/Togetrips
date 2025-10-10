import imageCompression from 'browser-image-compression';

const compressionOptions = {
  maxSizeMB: 2, // 최대 2MB
  maxWidthOrHeight: 1920, // 최대 가로/세로 1920px (FHD)
  useWebWorker: true, // 웹 워커 사용으로 성능 향상
  fileType: 'image/webp', // WebP 형식으로 압축 (JPEG 대비 25-35% 작은 용량)
  initialQuality: 0.7, // 초기 품질 70% (적극적 압축으로 용량 최적화)
};

export const compressImage = async (file: File): Promise<File> => {
  try {
    const compressedFile = await imageCompression(file, compressionOptions);

    return compressedFile;
  } catch (error) {
    console.error('❌ 이미지 압축 실패:', error);
    throw new Error('이미지 압축에 실패했습니다. 다시 시도해주세요.');
  }
};
