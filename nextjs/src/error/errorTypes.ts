export type ErrorType = 'location' | 'auth' | 'network' | 'permission' | 'timeout' | 'unknown';

export interface ErrorInfo {
  title: string;
  description: string;
  type: ErrorType;
  solutions: string[];
  icon?: React.ReactNode;
  severity: 'low' | 'medium' | 'high';
}
