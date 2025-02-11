import { useAuthStore } from '../../store/useAuthStore'; 
import RequestCard from './RequestCard';
import { Request, RequestUserProfile } from '../shared/types/requestTypes';
import { requestService } from '../shared/services/requestService'; 
import LoadingIndicator from '../../components/LoadingIndicator'; 
import { useQuery } from '@tanstack/react-query';

const RequestCardList = () => {
  const user = useAuthStore((state) => state.user);

  const { data: requests = [], isLoading } = useQuery<
    (Request & { sender: RequestUserProfile })[]
  >({
    queryKey: ['requests', user?.uid],
    queryFn: () => requestService.getMyRequests(user!.uid),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

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
    <div className="grid grid-cols-1 gap-5 w-full px-5 md:px-10 md:grid-cols-3 md:gap-8">
      {requests.map((request, index) => (
        <RequestCard key={index} request={request} />
      ))}
    </div>
  );
};

export default RequestCardList;
