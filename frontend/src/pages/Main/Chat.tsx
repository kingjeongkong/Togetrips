import { Outlet } from 'react-router-dom';
import Sidebar from '../../features/Main/components/Sidebar';

const Chat = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 pt-16 md:pt-5 md:pl-60">
        <Outlet />
      </main>
    </div>
  );
};

export default Chat;
