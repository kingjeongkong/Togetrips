import DataFetchErrorBoundary from '../../components/ErrorBoundary/DataFetchErrorBoundary';
import Sidebar from '../../features/shared/components/Sidebar';
import MainProfile from '../../features/shared/section/Profile/components/MainProfile';

const Profile = () => {
  return (
    <div className="flex min-h-screen bg-gray-100 overflow-y-auto">
      <Sidebar />
      <main className="flex-1 pt-16 pb-20 md:pt-5 md:pl-60 md:pb-5">
        <DataFetchErrorBoundary>
          <MainProfile />
        </DataFetchErrorBoundary>
      </main>
    </div>
  );
};

export default Profile;
