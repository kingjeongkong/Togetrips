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
    case 'auth/email-already-in-use':
      return 'Email already in use';
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled';
    case 'auth/popup-blocked':
      return 'Popup was blocked by the browser';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address but different sign-in credentials';
    default:
      return 'An error occurred. Please try again.';
  }
};
