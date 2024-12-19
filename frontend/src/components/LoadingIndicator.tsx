import { ClipLoader } from 'react-spinners';

interface LoadingIndicatorProps {
  color?: string;
  size?: number;
}

const LoadingIndicator = ({ color, size }: LoadingIndicatorProps) => {
  return (
    <div className="inline-flex">
      <ClipLoader color={color} size={size} />
    </div>
  );
};

export default LoadingIndicator;
