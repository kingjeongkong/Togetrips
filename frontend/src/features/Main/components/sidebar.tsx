import { IconType } from 'react-icons';
import { FaBell, FaHome, FaUserAlt } from 'react-icons/fa';
import { MdChat } from 'react-icons/md';
import SidebarItem from './SidebarItem';

interface MenuItem {
  title: string;
  icon: IconType;
  to: string;
}

const Sidebar = () => {
  const menuItems: MenuItem[] = [
    { title: 'Home', icon: FaHome, to: '/home' },
    { title: 'Chat', icon: MdChat, to: '/chat' },
    { title: 'Requests', icon: FaBell, to: '/requests' },
    { title: 'Profile', icon: FaUserAlt, to: '/profile' }
  ];

  return (
    <div className="fixed top-0 left-0 h-screen w-60 bg-sky-200">
      <p className="text-2xl text-center font-bold mt-5 mb-10">
        Travel Together
      </p>

      <div className="flex flex-col items-center space-y-1">
        {menuItems.map((item, index) => (
          <SidebarItem
            key={index}
            title={item.title}
            icon={item.icon}
            to={item.to}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
