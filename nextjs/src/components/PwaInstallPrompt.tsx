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
  const ua = navigator.userAgent;
  // 'Safari'는 포함하지만, 다른 iOS 브라우저 식별자는 제외
  return /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|Coast|Opera Mini|Tenta|UCBrowser/.test(ua);
};

const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.innerWidth <= 768 && window.innerHeight <= 1024)
  );
};

// --- Sub Components ---

// iOS 비Safari 브라우저용 안내 컴포넌트 (URL 복사 방식)
const IOSNonSafariPrompt = ({ onClose }: { onClose: () => void }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    if (typeof window === 'undefined') return;

    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('URL 복사에 실패했습니다:', err);
        alert('URL 복사에 실패했습니다. 수동으로 복사해주세요.');
      });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiExternalLink className="w-8 h-8 text-blue-600" />
          </div>

          <h3 className="text-lg font-semibold mb-2">Safari에서 열어주세요</h3>
          <p className="text-sm text-gray-600 mb-6">
            앱 설치와 푸시 알림을 위해, 아래 버튼으로 주소를 복사한 후 Safari에 붙여넣어 주세요.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleCopyUrl}
              className={`w-full px-4 py-2 text-white rounded-md transition-colors ${
                copied ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {copied ? '주소 복사 완료!' : '주소 복사하기'}
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
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
      description: 'Tap the share button in Safari toolbar',
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
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FiDownload className="w-6 h-6 text-blue-600" />
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
              className="px-4 py-2 text-gray-600 disabled:opacity-50"
            >
              Previous
            </button>

            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${index + 1 === step ? 'bg-blue-600' : 'bg-gray-300'}`}
                />
              ))}
            </div>

            <button
              onClick={() => setStep(Math.min(3, step + 1))}
              disabled={step === 3}
              className="px-4 py-2 text-blue-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

// 자동 설치 지원 브라우저용 설치 프롬프트 (Android 등)
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiDownload className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Togetrips 앱 설치</h3>
          <p className="text-sm text-gray-600 mb-6">
            홈 화면에 앱을 추가하여 더 빠르고 편리하게 이용하세요.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleInstallClick}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              설치
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              나중에
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 상단 배너 컴포넌트
const InstallBanner = ({
  onInstallClick,
  onClose,
}: {
  onInstallClick: () => void;
  onClose: () => void;
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-gray-100 p-3 shadow-md border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between max-w-4xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FiDownload className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-gray-800">Togetrips를 앱으로 사용해보세요!</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onInstallClick}
            className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full hover:bg-blue-700"
          >
            설치
          </button>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAutoInstallModal, setShowAutoInstallModal] = useState(false);
  const [showSafariGuideModal, setShowSafariGuideModal] = useState(false);
  const [showIOSRedirectModal, setShowIOSRedirectModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [installMethod, setInstallMethod] = useState<'auto' | 'safari' | 'redirect' | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const initPwaState = () => {
      // 모바일이 아니거나 이미 standalone 모드면 아무것도 하지 않음
      if (
        !isMobile() ||
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
      ) {
        return;
      }

      if (isIOS()) {
        if (isSafari()) {
          setInstallMethod('safari');
        } else {
          setInstallMethod('redirect');
        }
        setShowBanner(true);
        return;
      }

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setInstallMethod('auto');
        setShowBanner(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    };

    initPwaState();

    const handleAppInstalled = () => {
      setShowBanner(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installMethod) return;

    setShowBanner(false);
    switch (installMethod) {
      case 'auto':
        setShowAutoInstallModal(true);
        break;
      case 'safari':
        setShowSafariGuideModal(true);
        break;
      case 'redirect':
        setShowIOSRedirectModal(true);
        break;
    }
  };

  if (!isClient) return null;

  if (showBanner) {
    return (
      <InstallBanner onInstallClick={handleInstallClick} onClose={() => setShowBanner(false)} />
    );
  }

  if (showAutoInstallModal && deferredPrompt) {
    return (
      <AutoInstallPrompt
        deferredPrompt={deferredPrompt}
        onClose={() => setShowAutoInstallModal(false)}
      />
    );
  }

  if (showSafariGuideModal) {
    return <SafariInstallGuide onClose={() => setShowSafariGuideModal(false)} />;
  }

  if (showIOSRedirectModal) {
    return <IOSNonSafariPrompt onClose={() => setShowIOSRedirectModal(false)} />;
  }

  return null;
};

export default PwaInstallPrompt;
