'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconType } from 'react-icons';

interface SidebarItemProps {
  title: string;
  icon: IconType;
  to: string;
  count?: number;
}

const SidebarItem = ({ title, icon: Icon, to, count }: SidebarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname.startsWith(to);

  return (
    <Link
      href={to}
      className={`flex flex-row items-center justify-center px-2 py-4 rounded w-full relative md:justify-start md:px-6 md:py-4 md:gap-2 ${
        isActive ? 'bg-sky-700 text-white' : 'text-gray-600 hover:bg-sky-600 hover:text-white'
      }`}
      aria-label={`Navigate to ${title.toLowerCase()}`}
    >
      <Icon className="text-lg mr-2" />
      <span className="hidden md:inline">{title}</span>

      {count && count > 0 && (
        <div className="absolute top-1/6 right-5/12 md:left-1/7">
          <span className="flex items-center justify-center w-4 h-4 md:w-5 md:h-5 text-xs font-bold text-white bg-red-500 rounded-full border-1 border-white md:border-none">
            {count > 99 ? '99+' : count}
          </span>
        </div>
      )}
    </Link>
  );
};

export default SidebarItem;
