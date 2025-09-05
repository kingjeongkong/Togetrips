import LoadingIndicator from '@/components/LoadingIndicator';
import React from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export const NotificationCenter: React.FC = () => {
  const {
    settings,
    permission,
    isLoading,
    error,
    isEnabledOnThisDevice,
    isEnabling,
    isDisabling,
    isUpdatingType,
    enableNotifications,
    disableNotifications,
    updateNotificationType,
  } = usePushNotifications();

  if (isLoading) {
    return (
      <div className="w-full h-[150px] flex items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  // 설정이 없거나 권한이 거부된 경우 안내 메시지
  if (!settings || permission === 'denied') {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="ml-2 text-sm font-medium text-yellow-800">
            {!settings ? 'Notifications Not Enabled' : 'Notification Permission Required'}
          </h3>
        </div>
        <p className="text-sm text-yellow-700 mb-3">
          {!settings
            ? 'To receive push notifications, you need to enable notifications first.'
            : 'To receive push notifications, you need to allow notifications in your browser settings.'}
        </p>
      </div>
    );
  }

  // 메인 알림 설정 UI
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
          <p className="text-sm text-gray-500 mt-1">Manage your push notification preferences</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => (isEnabledOnThisDevice ? disableNotifications() : enableNotifications())}
            disabled={isEnabling || isDisabling}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isEnabledOnThisDevice ? 'bg-blue-600' : 'bg-gray-200'
            } ${isEnabling || isDisabling ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEnabledOnThisDevice ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error.message || 'An error occurred while loading settings'}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Chat Notifications</h4>
            <p className="text-xs text-gray-500">Receive notifications for new chat messages</p>
          </div>
          <button
            onClick={() =>
              updateNotificationType({
                chat_notifications: !settings.chat_notifications,
              })
            }
            disabled={!isEnabledOnThisDevice || isUpdatingType}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              settings.chat_notifications && isEnabledOnThisDevice ? 'bg-blue-600' : 'bg-gray-200'
            } ${!isEnabledOnThisDevice || isUpdatingType ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.chat_notifications && isEnabledOnThisDevice
                  ? 'translate-x-6'
                  : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Request Notifications</h4>
            <p className="text-xs text-gray-500">Receive notifications for travel buddy requests</p>
          </div>
          <button
            onClick={() =>
              updateNotificationType({
                request_notifications: !settings.request_notifications,
              })
            }
            disabled={!isEnabledOnThisDevice || isUpdatingType}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              settings.request_notifications && isEnabledOnThisDevice
                ? 'bg-blue-600'
                : 'bg-gray-200'
            } ${!isEnabledOnThisDevice || isUpdatingType ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.request_notifications && isEnabledOnThisDevice
                  ? 'translate-x-6'
                  : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
