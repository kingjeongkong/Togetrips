import DataFetchErrorBoundary from '../../components/ErrorBoundary/DataFetchErrorBoundary';
import Sidebar from '../../features/shared/components/Sidebar';
import RequestCardList from '../../features/request/RequestCardList'; 

const Requests = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 pt-16 md:pt-5 md:pl-60 pb-20 md:pb-5">
        <div className="flex flex-col items-center justify-center gap-1 mb-5">
          <p className="font-semibold text-xl md:text-3xl">Travel Requests</p>
          <p className="text-sm md:text-lg text-gray-600">
            Review Travel Requests from other users.
          </p>
        </div>
        <DataFetchErrorBoundary>
          <RequestCardList />
        </DataFetchErrorBoundary>
      </main>
    </div>
  );
};

export default Requests;
