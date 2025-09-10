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

// Supabase 에러를 사용자 친화적인 메시지로 변환
export const getErrorMessage = (error: any): string => {
  // 에러 코드가 있으면 코드 기반으로 처리
  if (error?.code) {
    switch (error.code) {
      // 회원가입 관련 에러
      case 'email_already_exists':
        return 'This email is already registered.\nPlease try signing in instead.';
      case 'signup_disabled':
        return 'New account registration is currently disabled.\nPlease contact support.';
      case 'weak_password':
        return 'Password is too weak.\nPlease choose a stronger password with at least 8 characters.';

      // 로그인 관련 에러
      case 'invalid_login_credentials':
      case 'invalid_credentials':
        return 'Invalid email or password.\nPlease check your email and password and try again.';
      case 'email_not_confirmed':
        return 'Please check your email and click the confirmation link before signing in.';
      case 'too_many_requests':
        return 'Too many failed attempts.\nPlease wait a few minutes before trying again.';
      case 'user_not_found':
        return 'No account found with this email.\nPlease check your email or sign up for a new account.';
      case 'wrong_password':
        return 'Incorrect password.\nPlease try again or reset your password.';

      // OAuth 관련 에러
      case 'popup_closed_by_user':
        return 'Sign in was cancelled.\nPlease try again if you want to continue.';
      case 'popup_blocked':
        return 'Popup was blocked by your browser.\nPlease allow popups for this site and try again.';
      case 'oauth_account_not_linked':
        return 'This email is already registered with a different sign-in method.\nPlease use the original method or contact support.';

      // 네트워크 및 서버 에러
      case 'network_error':
        return 'Network error.\nPlease check your internet connection and try again.';
      case 'service_unavailable':
        return 'Service temporarily unavailable.\nPlease try again in a few minutes.';
      case 'internal_error':
        return 'Something went wrong on our end.\nPlease try again later.';

      // 기타 에러
      case 'invalid_request':
        return 'Invalid request.\nPlease refresh the page and try again.';
      case 'session_not_found':
        return 'Your session has expired.\nPlease sign in again.';
      case 'access_denied':
        return 'Access denied.\nPlease contact support if you believe this is an error.';

      default:
        // 코드가 있지만 매칭되지 않는 경우, 메시지 기반으로 폴백
        break;
    }
  }

  // 에러 메시지 기반으로 처리 (코드가 없거나 매칭되지 않는 경우)
  if (error?.message) {
    const message = error.message.toLowerCase();

    // 로그인 관련 에러
    if (
      message.includes('invalid login credentials') ||
      message.includes('invalid email or password')
    ) {
      return 'Invalid email or password.\nPlease check your email and password and try again.';
    }
    if (message.includes('user not found') || message.includes('no user found')) {
      return 'No account found with this email.\nPlease check your email or sign up for a new account.';
    }
    if (message.includes('wrong password') || message.includes('incorrect password')) {
      return 'Incorrect password.\nPlease try again or reset your password.';
    }
    if (message.includes('email not confirmed') || message.includes('confirmation')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    if (message.includes('too many requests') || message.includes('rate limit')) {
      return 'Too many failed attempts.\nPlease wait a few minutes before trying again.';
    }

    // 회원가입 관련 에러
    if (
      message.includes('email already registered') ||
      message.includes('user already registered')
    ) {
      return 'This email is already registered.\nPlease try signing in instead.';
    }
    if (message.includes('weak password') || message.includes('password too weak')) {
      return 'Password is too weak.\nPlease choose a stronger password with at least 8 characters.';
    }
    if (message.includes('signup disabled')) {
      return 'New account registration is currently disabled.\nPlease contact support.';
    }

    // OAuth 관련 에러
    if (message.includes('popup closed') || message.includes('user cancelled')) {
      return 'Sign in was cancelled.\nPlease try again if you want to continue.';
    }
    if (message.includes('popup blocked') || message.includes('blocked popup')) {
      return 'Popup was blocked by your browser.\nPlease allow popups for this site and try again.';
    }
    if (message.includes('oauth account not linked')) {
      return 'This email is already registered with a different sign-in method.\nPlease use the original method or contact support.';
    }

    // 네트워크 및 서버 에러
    if (message.includes('network') || message.includes('connection')) {
      return 'Network error.\nPlease check your internet connection and try again.';
    }
    if (message.includes('service unavailable') || message.includes('temporarily unavailable')) {
      return 'Service temporarily unavailable.\nPlease try again in a few minutes.';
    }
    if (message.includes('internal error') || message.includes('server error')) {
      return 'Something went wrong on our end.\nPlease try again later.';
    }

    // 기타 에러
    if (message.includes('invalid request')) {
      return 'Invalid request.\nPlease refresh the page and try again.';
    }
    if (message.includes('session not found') || message.includes('expired')) {
      return 'Your session has expired.\nPlease sign in again.';
    }
    if (message.includes('access denied') || message.includes('forbidden')) {
      return 'Access denied.\nPlease contact support if you believe this is an error.';
    }
  }

  // 기본 에러 메시지
  return 'An unexpected error occurred.\nPlease try again or contact support if the problem persists.';
};
