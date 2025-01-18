import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ReactNode } from 'react';
import BaseErrorBoundary from './BaseErrorBoundary';

interface DataFetchErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const DefaultFallback = ({ reset }: { reset: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg">
      <h3 className="text-red-800 font-medium">Failed to fetch data</h3>
      <p className="text-red-600 text-sm mt-1">Try again later</p>
      <button
        onClick={reset}
        className="mt-2 text-sm text-red-800 hover:text-red-900 bg-red-100 px-3 py-1 rounded"
      >
        Retry
      </button>
    </div>
  );
};

const DataFetchErrorBoundary = ({ children, fallback }: DataFetchErrorBoundaryProps) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <BaseErrorBoundary fallback={fallback ?? <DefaultFallback reset={reset} />}>
          {children}
        </BaseErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

export default DataFetchErrorBoundary;
