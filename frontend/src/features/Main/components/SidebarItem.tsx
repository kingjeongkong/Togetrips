import { IconType } from 'react-icons';
import { NavLink } from 'react-router-dom';

interface SidebarItemProps {
  title: string;
  icon: IconType;
  to: string;
}

const SidebarItem = ({ title, icon: Icon, to }: SidebarItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-row items-center justify-center px-2 py-4 rounded w-11/12 ${
          isActive
            ? 'bg-sky-700 text-white'
            : 'text-gray-600  hover:bg-sky-600 hover:text-white'
        }`
      }
    >
      <Icon className="text-lg mr-2" />
      <span className="hidden md:inline">{title}</span>
    </NavLink>
  );
};

export default SidebarItem;
