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
            데이터를 불러오는 중 오류가 발생했습니다
          </h2>
          <p className="text-sm text-red-500 mb-2">
            {this.state.error?.message || '예기치 않은 오류가 발생했습니다'}
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
            새로고침
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DataFetchErrorBoundary;
