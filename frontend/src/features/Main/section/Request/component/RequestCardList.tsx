import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../../../store/useAuthStore';
import RequestCard from './RequestCard';
import { Request, RequestUserProfile } from '../../../types/requestTypes';
import { requestService } from '../../../services/requestService';
import LoadingIndicator from '../../../../../components/LoadingIndicator';

const RequestCardList = () => {
  const user = useAuthStore((state) => state.user);
  const [requests, setRequests] = useState<(Request & { sender: RequestUserProfile })[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      const receivedRequests = await requestService.getMyRequests(user.uid);
      setRequests(receivedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      // ToDo : 실패 시 UI 알림 처리
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  if (isLoading) {
    return (
      <div className="w-full h-[150px] flex items-center justify-center">
        <LoadingIndicator color="#6366f1" size={50} />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center text-xl font-semibold text-indigo-500 mt-10">
        No Requests
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 w-full px-10 md:grid-cols-3 md:gap-8">
      {requests.map((request, index) => (
        <RequestCard key={index} request={request} onStatusChange={fetchRequests} />
      ))}
    </div>
  );
};

export default RequestCardList;
