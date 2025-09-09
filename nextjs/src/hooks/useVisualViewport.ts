'use client';

import { useEffect, useRef } from 'react';

// onResize 콜백이 받을 인자의 타입을 정의합니다.
interface ResizeInfo {
  oldHeight: number;
  newHeight: number;
  delta: number; // 높이 변화량
}

/**
 * Visual Viewport API를 사용하여 실제 보이는 영역의 높이를 추적하고
 * CSS 변수(--vh)로 설정하는 훅
 *
 * 모바일 브라우저에서 URL 바, 키보드 등의 UI 요소가 나타나거나 사라질 때
 * 실제 보이는 콘텐츠 영역의 높이를 정확하게 계산하여 제공합니다.
 *
 * @param onResize - 뷰포트 높이가 변경될 때 호출되는 콜백 함수
 */
export const useVisualViewport = (onResize?: (info: ResizeInfo) => void) => {
  // 이전 높이를 기억하기 위한 ref
  const previousHeightRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const visualViewport = window.visualViewport;

    const setViewportHeight = () => {
      const newHeight = visualViewport.height;

      // CSS 변수 설정 (기존 로직 유지)
      document.documentElement.style.setProperty('--vh', `${newHeight}px`);

      // onResize 콜백이 있고, 이전 높이값이 존재할 때만 실행
      if (onResize && previousHeightRef.current !== null) {
        const oldHeight = previousHeightRef.current;
        const delta = newHeight - oldHeight; // 변화량 계산

        // 변화가 있을 때만 콜백 호출
        if (delta !== 0) {
          onResize({ oldHeight, newHeight, delta });
        }
      }

      // 현재 높이를 다음 이벤트를 위해 저장
      previousHeightRef.current = newHeight;
    };

    // 초기 높이 설정
    previousHeightRef.current = visualViewport.height;
    setViewportHeight();

    visualViewport.addEventListener('resize', setViewportHeight);
    return () => visualViewport.removeEventListener('resize', setViewportHeight);
  }, [onResize]); // onResize가 변경될 때마다 effect를 재실행
};
