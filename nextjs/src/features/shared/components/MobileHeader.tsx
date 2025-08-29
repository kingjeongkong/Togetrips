import Image from 'next/image';
import { usePathname } from 'next/navigation';

export const MobileHeader = () => {
  const pathname = usePathname();
  const isChatRoute = pathname.startsWith('/chat');

  // 채팅 화면에서는 헤더를 표시하지 않음
  if (isChatRoute) {
    return null;
  }

  return (
    // md:hidden: 데스크탑에서는 이 헤더를 숨김
    <header className="md:hidden sticky top-0 left-0 right-0 z-20 w-full flex items-center justify-start px-4 py-2 bg-gray-100 shadow-sm">
      <div className="flex items-center">
        <Image
          src="/togetrips-logo.png"
          alt="Togetrips"
          width={32}
          height={32}
          className="w-8 h-8 mr-2"
        />
        <p className="font-bold text-xl text-black">Togetrips</p>
      </div>
    </header>
  );
};
