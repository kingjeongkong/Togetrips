import { ClipLoader } from 'react-spinners';

interface LoadingIndicatorProps {
  color?: string;
  size?: number;
}

const LoadingIndicator = ({ color, size }: LoadingIndicatorProps) => {
  return (
    <div className="flex items-center justify-center">
      <ClipLoader color={color} size={size} />
    </div>
  );
};

export default LoadingIndicator;
