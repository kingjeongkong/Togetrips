'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconType } from 'react-icons';

interface SidebarItemProps {
  title: string;
  icon: IconType;
  to: string;
}

const SidebarItem = ({ title, icon: Icon, to }: SidebarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname.startsWith(to);

  return (
    <Link
      href={to}
      className={`flex flex-row items-center justify-center px-2 py-4 rounded w-11/12 ${
        isActive ? 'bg-sky-700 text-white' : 'text-gray-600 hover:bg-sky-600 hover:text-white'
      }`}
      aria-label={`Navigate to ${title.toLowerCase()}`}
    >
      <Icon className="text-lg mr-2" />
      <span className="hidden md:inline">{title}</span>
    </Link>
  );
};

export default SidebarItem;
