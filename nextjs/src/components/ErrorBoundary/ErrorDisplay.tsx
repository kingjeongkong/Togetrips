'use client';

import { ErrorInfo } from '@/error/errorTypes';
import { FaExclamationTriangle, FaMapMarkerAlt, FaWifi } from 'react-icons/fa';

interface ErrorDisplayProps {
  errorInfo: ErrorInfo;
  onRefresh?: () => void;
}

const ErrorDisplay = ({ errorInfo, onRefresh }: ErrorDisplayProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'permission':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'timeout':
      case 'network':
        return <FaWifi className="text-red-500" />;
      case 'location':
        return <FaMapMarkerAlt className="text-red-500" />;
      default:
        return <FaExclamationTriangle className="text-red-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'from-yellow-50 to-orange-50 border-yellow-200';
      case 'medium':
        return 'from-red-50 to-pink-50 border-red-200';
      case 'high':
        return 'from-red-100 to-red-50 border-red-300';
      default:
        return 'from-red-50 to-pink-50 border-red-200';
    }
  };

  return (
    <div
      className={`p-6 bg-gradient-to-r ${getSeverityColor(errorInfo.severity)} rounded-lg border`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">{getIcon(errorInfo.type)}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 mb-2">{errorInfo.title}</h3>
          <p className="text-sm text-red-600 mb-4">{errorInfo.description}</p>

          <div className="bg-white rounded-lg p-4 mb-4 border border-red-100">
            <h4 className="text-sm font-medium text-red-800 mb-2">Solutions:</h4>
            <ul className="space-y-1">
              {errorInfo.solutions.map((solution, index) => (
                <li key={index} className="text-sm text-red-700 flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  {solution}
                </li>
              ))}
            </ul>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            >
              Refresh Page
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
