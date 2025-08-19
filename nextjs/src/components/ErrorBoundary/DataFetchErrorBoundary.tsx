'use client';

import { ErrorService } from '@/error/errorService';
import { Component, ErrorInfo, ReactNode } from 'react';
import ErrorDisplay from './ErrorDisplay';

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

  private handleRefresh = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // ErrorService를 사용하여 에러 정보 가져오기
      const errorInfo = ErrorService.getErrorInfo(this.state.error!);

      return <ErrorDisplay errorInfo={errorInfo} onRefresh={this.handleRefresh} />;
    }

    return this.props.children;
  }
}

export default DataFetchErrorBoundary;
