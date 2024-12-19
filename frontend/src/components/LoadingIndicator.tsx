import { FadeLoader } from 'react-spinners';

interface LoadingIndicatorProps {
  size: number;
}

const LoadingIndicator = ({ size }: LoadingIndicatorProps) => {
  return (
    <div className="flex items-center justify-center p-4">
      <FadeLoader color="#6366f1" width={size} height={size} margin={2} />
    </div>
  );
};

export default LoadingIndicator;
