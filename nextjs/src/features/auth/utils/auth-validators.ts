import { FormErrors, SignInFormData, SignUpFormData } from '../types/auth';

export const validateSignInForm = (data: SignInFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Email is invalid';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
};

export const validateSignUpForm = (data: SignUpFormData): FormErrors => {
  const errors = validateSignInForm(data);

  if (!data.name) {
    errors.name = 'Name is required';
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

export const getErrorMessage = (code: string): string => {
  switch (code) {
    case 'email_already_exists':
      return 'Email already in use';
    case 'invalid_login_credentials':
      return 'Invalid email or password';
    case 'popup_closed_by_user':
      return 'Sign in was cancelled';
    case 'popup_blocked':
      return 'Popup was blocked by the browser';
    default:
      return 'An error occurred. Please try again.';
  }
};
