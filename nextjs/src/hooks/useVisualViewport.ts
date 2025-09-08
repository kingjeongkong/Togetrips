'use client';

import { useEffect } from 'react';

// Visual Viewport API는 이미 브라우저에서 제공하는 타입이므로 별도 정의 불필요

/**
 * Visual Viewport API를 사용하여 실제 보이는 영역의 높이를 추적하고
 * CSS 변수(--vh)로 설정하는 훅
 *
 * 모바일 브라우저에서 URL 바, 키보드 등의 UI 요소가 나타나거나 사라질 때
 * 실제 보이는 콘텐츠 영역의 높이를 정확하게 계산하여 제공합니다.
 */
export const useVisualViewport = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setViewportHeight = () => {
      // visualViewport가 지원되면 그 높이를, 아니면 window.innerHeight를 사용
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // 초기 설정
    setViewportHeight();

    const visualViewport = window.visualViewport;
    if (visualViewport) {
      // Visual Viewport API 지원 시
      visualViewport.addEventListener('resize', setViewportHeight);
      return () => visualViewport.removeEventListener('resize', setViewportHeight);
    } else {
      // 폴백: 일반 resize 이벤트 사용
      window.addEventListener('resize', setViewportHeight);
      return () => window.removeEventListener('resize', setViewportHeight);
    }
  }, []);
};
