'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class DataFetchErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    if (process.env.NODE_ENV === 'development') {
      console.error('Uncaught error:', error);
      console.error('Error info:', errorInfo);
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 bg-red-50 rounded-lg">
          <h2 className="text-lg font-semibold text-red-600 mb-2">
            An error occurred while fetching data
          </h2>
          <p className="text-sm text-red-500 mb-2">
            {this.state.error?.message || 'An unexpected error has occurred'}
          </p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="bg-red-100 p-2 rounded text-xs overflow-auto max-h-40">
              {this.state.errorInfo?.componentStack}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DataFetchErrorBoundary;
