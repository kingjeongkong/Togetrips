/**
 * 날짜 포맷팅 유틸리티 함수들
 */

/**
 * 카드용 간단한 날짜 포맷 (예: "Jan 15, 09:00")
 */
export const formatCardDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 상세 페이지용 긴 날짜 포맷 (예: "Monday, January 15, 2024")
 */
export const formatDetailDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * 시간 포맷 (예: "09:00 AM")
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 상대적 시간 포맷 (예: "2 hours ago", "in 3 days")
 */
export const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
};

/**
 * 미래 상대적 시간 포맷 (예: "in 2 hours", "in 3 days")
 */
export const formatFutureRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.ceil(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.ceil(diffInMs / (1000 * 60));

  if (diffInDays > 0) {
    return `in ${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
  } else if (diffInDays < 0) {
    const absDays = Math.abs(diffInDays);
    return `${absDays} day${absDays > 1 ? 's' : ''} ago`;
  } else if (diffInHours > 0) {
    return `in ${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
  } else if (diffInHours < 0) {
    const absHours = Math.abs(diffInHours);
    return `${absHours} hour${absHours > 1 ? 's' : ''} ago`;
  } else if (diffInMinutes > 0) {
    return `in ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
  } else if (diffInMinutes < 0) {
    const absMinutes = Math.abs(diffInMinutes);
    return `${absMinutes} minute${absMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'now';
  }
};

/**
 * 날짜가 미래인지 확인
 */
export const isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
};

/**
 * 날짜가 오늘인지 확인
 */
export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * 날짜가 내일인지 확인
 */
export const isTomorrow = (dateString: string): boolean => {
  const date = new Date(dateString);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
};

/**
 * ISO 시간 문자열을 HTML time input용 HH:MM 형식으로 변환
 * 예: "2024-01-01T14:30:00.000Z" -> "14:30"
 */
export const formatTimeForInput = (isoString: string): string => {
  if (!isoString) return '';
  try {
    const timePart = isoString.split('T')[1];
    if (!timePart) return '';
    // 초와 밀리초 제거하고 HH:MM 형식으로 반환
    return timePart.split('.')[0].substring(0, 5);
  } catch {
    return '';
  }
};
