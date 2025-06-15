interface LoadingIndicatorProps {
  color?: string;
  size?: number;
}

const LoadingIndicator = ({ color = '#6366f1', size = 40 }: LoadingIndicatorProps) => {
  return (
    <div
      className="animate-spin rounded-full border-4 border-gray-200"
      style={{
        borderTopColor: color,
        width: size,
        height: size,
      }}
    />
  );
};

export default LoadingIndicator;
