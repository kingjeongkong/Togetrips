import Sidebar from '../../features/Main/components/Sidebar';
import MainProfile from '../../features/Main/section/Profile/components/MainProfile';

const Profile = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 pt-16 md:pt-5 md:pl-60">
        <MainProfile />
      </main>
    </div>
  );
};

export default Profile;
