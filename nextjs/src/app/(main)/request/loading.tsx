import LoadingIndicator from '@/components/LoadingIndicator';

export default function RequestLoading() {
  return (
    <div className="w-full h-[60vh] flex items-center justify-center">
      <LoadingIndicator color="#3b82f6" size={48} />
    </div>
  );
}
