import LoadingIndicator from '@/components/LoadingIndicator';

export default function ProfileLoading() {
  return (
    <div className="w-full h-[60vh] flex items-center justify-center">
      <LoadingIndicator color="#6366f1" size={48} />
    </div>
  );
}
