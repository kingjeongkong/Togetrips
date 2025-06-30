import type { FormErrors, SignUpFormData } from '@/features/auth/types/auth';
import { validateSignUpForm } from '@/features/auth/utils/auth-validators';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

export const useAuth = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [authError, setAuthError] = useState('');

  // callbackUrl을 가져오는 함수
  const getCallbackUrl = () => {
    const callbackUrl = searchParams.get('callbackUrl');
    return callbackUrl || '/home';
  };

  // Google 로그인
  const handleGoogleSignIn = async () => {
    setAuthError('');
    setIsLoading(true);

    try {
      // Google 로그인 시작 시 리다이렉트 상태로 전환
      setIsRedirecting(true);
      await signIn('google', { callbackUrl: getCallbackUrl() });
    } catch {
      setAuthError('An error occurred during Google sign in.');
      setIsLoading(false);
      setIsRedirecting(false);
    }
  };

  // 이메일/비밀번호 회원가입 (자동 로그인 X)
  const handleSignUp = async (formData: SignUpFormData) => {
    setErrors({});
    setAuthError('');
    const validationErrors = validateSignUpForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Sign up completed successfully!');
        router.push('/auth/signin');
      } else {
        setAuthError(data.message || 'Sign up failed.');
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred during sign up.';
      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 이메일/비밀번호 로그인
  const handleSignIn = async (email: string, password: string) => {
    setAuthError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        isSignUp: false,
      });
      if (result?.error) {
        setAuthError(result.error);
        setIsLoading(false);
      } else {
        // 로그인 성공 시 리다이렉트 상태로 전환
        setIsRedirecting(true);
        // callbackUrl로 리다이렉트
        router.push(getCallbackUrl());
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred during sign in.';
      setAuthError(errorMessage);
      setIsLoading(false);
    }
  };

  // 로그아웃
  const handleSignOut = async () => {
    setAuthError('');
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/auth/signin' });
    } catch {
      setAuthError('An error occurred during sign out.');
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isRedirecting,
    errors,
    authError,
    session,
    handleGoogleSignIn,
    handleSignUp,
    handleSignIn,
    handleSignOut,
  };
};
