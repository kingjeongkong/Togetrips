'use client';

import { useEffect, useState } from 'react';
import { FiCheck, FiDownload, FiExternalLink, FiHome, FiShare, FiX } from 'react-icons/fi';

// iOS Safari 전용 속성 타입 확장
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// 브라우저 감지 함수들 (SSR 안전)
const isSafari = () => {
  if (typeof window === 'undefined') return false;
  return /Safari/.test(navigator.userAgent) && !/Chrome|Firefox|Edge/.test(navigator.userAgent);
};

const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// 모바일 브라우저 감지 (SSR 안전)
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.innerWidth <= 768 && window.innerHeight <= 1024)
  );
};

// Safari로 리다이렉트 함수
const redirectToSafari = () => {
  if (typeof window === 'undefined') return;

  const currentUrl = window.location.href;
  const safariUrl = `x-web-search://?${encodeURIComponent(currentUrl)}`;

  // Safari로 리다이렉트 시도
  window.location.href = safariUrl;

  // 실패 시 fallback (1초 후)
  setTimeout(() => {
    if (document.hidden) {
      // Safari로 이동 성공
      return;
    }
    // 실패 시 수동 안내
    alert('Safari를 열고 이 URL로 접속해주세요: ' + currentUrl);
  }, 1000);
};

// iOS 비Safari 브라우저용 리다이렉트 안내 컴포넌트
const IOSNonSafariPrompt = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiExternalLink className="w-8 h-8 text-blue-600" />
          </div>

          <h3 className="text-lg font-semibold mb-2">Safari에서 설치해주세요</h3>
          <p className="text-sm text-gray-600 mb-6">
            PWA 설치와 푸시 알림을 사용하려면 Safari 브라우저가 필요합니다.
          </p>

          <div className="space-y-3">
            <button
              onClick={redirectToSafari}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Safari로 이동
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              나중에
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Safari 설치 가이드 컴포넌트
const SafariInstallGuide = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: 'Step 1: Tap Share Button',
      description: "Tap the share button in Safari's toolbar",
      icon: <FiShare className="w-6 h-6 text-blue-600" />,
    },
    {
      title: 'Step 2: Add to Home Screen',
      description: "Scroll down and tap 'Add to Home Screen'",
      icon: <FiHome className="w-6 h-6 text-blue-600" />,
    },
    {
      title: 'Step 3: Confirm Installation',
      description: "Tap 'Add' to confirm the installation",
      icon: <FiCheck className="w-6 h-6 text-blue-600" />,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiDownload className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-4">Install Togetrips App</h3>

          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">{steps[step - 1].icon}</div>
            <h4 className="font-medium mb-2 text-gray-900">{steps[step - 1].title}</h4>
            <p className="text-sm text-gray-600">{steps[step - 1].description}</p>
          </div>

          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-4 py-2 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index + 1 === step ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setStep(Math.min(3, step + 1))}
              disabled={step === 3}
              className="px-4 py-2 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

// 자동 설치 지원 브라우저용 설치 프롬프트 (Chrome, Edge, Firefox 등)
const AutoInstallPrompt = ({
  deferredPrompt,
  onClose,
}: {
  deferredPrompt: BeforeInstallPromptEvent;
  onClose: () => void;
}) => {
  const handleInstallClick = async () => {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('사용자가 PWA 설치를 수락했습니다');
    } else {
      console.log('사용자가 PWA 설치를 거부했습니다');
    }

    onClose();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FiDownload className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Install Togetrips App</h3>
            <p className="text-xs text-gray-600">Add to your home screen for quicker access</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Install
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// 메인 PWA 설치 컴포넌트
const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAutoInstallPrompt, setShowAutoInstallPrompt] = useState(false);
  const [showSafariGuide, setShowSafariGuide] = useState(false);
  const [showIOSRedirect, setShowIOSRedirect] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    setIsClient(true);

    // 모바일이 아니면 아무것도 표시하지 않음
    if (!isMobile()) {
      return;
    }

    // PWA 설치 완료 감지
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowAutoInstallPrompt(false);
      setShowSafariGuide(false);
      setShowIOSRedirect(false);
    };

    // 자동 설치 지원 브라우저용 설치 이벤트 (Chrome, Edge, Firefox 등)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAutoInstallPrompt(true);
    };

    // iOS 브라우저별 처리
    if (isIOS()) {
      if (isSafari()) {
        // iOS Safari: 설치 가이드 표시
        setShowSafariGuide(true);
      } else {
        // iOS 비Safari: Safari로 리다이렉트 안내
        setShowIOSRedirect(true);
      }
    }

    // 이미 PWA로 실행 중인지 확인
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      } else if (window.navigator.standalone === true) {
        setIsInstalled(true);
      }
    };

    checkIfInstalled();

    // 이벤트 리스너 등록
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // SSR 중이거나 클라이언트가 아니면 아무것도 표시하지 않음
  if (!isClient) {
    return null;
  }

  // 모바일이 아니면 아무것도 표시하지 않음
  if (!isMobile()) {
    return null;
  }

  // 이미 설치되어 있으면 아무것도 표시하지 않음
  if (isInstalled) {
    return null;
  }

  // 자동 설치 지원 브라우저용 프롬프트 (Android, Desktop)
  if (showAutoInstallPrompt && deferredPrompt) {
    return (
      <AutoInstallPrompt
        deferredPrompt={deferredPrompt}
        onClose={() => setShowAutoInstallPrompt(false)}
      />
    );
  }

  // iOS Safari용 가이드
  if (showSafariGuide) {
    return <SafariInstallGuide onClose={() => setShowSafariGuide(false)} />;
  }

  // iOS 비Safari 브라우저용 리다이렉트 안내
  if (showIOSRedirect) {
    return <IOSNonSafariPrompt onClose={() => setShowIOSRedirect(false)} />;
  }

  return null;
};

export default PwaInstallPrompt;
