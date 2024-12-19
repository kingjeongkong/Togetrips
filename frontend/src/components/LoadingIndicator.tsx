import { AiOutlineLoading3Quarters } from 'react-icons/ai';

interface LoadingIndicatorProps {
  type?: 'component' | 'global';
  size?: 'sm' | 'md' | 'lg';
}

const LoadingIndicator = ({ type = 'component', size = 'md' }: LoadingIndicatorProps) => {
  const sizeClass = {
    sm: 'text-sm',
    md: 'text-md',
    lg: 'text-lg'
  }[size];

  const loadingComponent = (
    <AiOutlineLoading3Quarters className={`${sizeClass} text-indigo-500 animate-spin`} />
  );

  if (type === 'global') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">{loadingComponent}</div>
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{loadingComponent}</div>;
};

export default LoadingIndicator;
