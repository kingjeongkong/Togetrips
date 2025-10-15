import { UpsertGatheringRequest } from '../types/gatheringTypes';

/**
 * 모임 생성 폼 데이터의 유효성을 검사하는 함수
 * @param formData - 검사할 폼 데이터
 * @returns 유효성 검사 에러 객체. 에러가 없으면 빈 객체를 반환
 */
export const validateGatheringForm = (formData: UpsertGatheringRequest): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!formData.activity_title.trim()) {
    errors.activity_title = 'Activity title is required';
  }

  if (!formData.description.trim()) {
    errors.description = 'Description is required';
  }

  if (!formData.gathering_time) {
    errors.gathering_time = 'Gathering time is required';
  } else {
    const selectedDate = new Date(formData.gathering_time);
    const now = new Date();
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 10);

    if (selectedDate <= now) {
      errors.gathering_time = 'Gathering time must be in the future';
    } else if (selectedDate > maxDate) {
      errors.gathering_time = 'Gathering time must be within 10 days from today';
    }
  }

  if (!formData.city.trim()) {
    errors.city = 'City is required';
  }

  if (formData.max_participants < 2) {
    errors.max_participants = 'Maximum participants must be at least 2';
  }

  return errors;
};

/**
 * 특정 필드의 에러를 제거하는 헬퍼 함수
 * @param errors - 현재 에러 객체
 * @param field - 제거할 필드명
 * @returns 필드 에러가 제거된 새로운 에러 객체
 */
export const removeFieldError = (
  errors: Record<string, string>,
  field: string,
): Record<string, string> => {
  const newErrors = { ...errors };
  delete newErrors[field];
  return newErrors;
};

/**
 * 폼이 유효한지 확인하는 헬퍼 함수
 * @param errors - 에러 객체
 * @returns 유효하면 true, 그렇지 않으면 false
 */
export const isFormValid = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length === 0;
};
