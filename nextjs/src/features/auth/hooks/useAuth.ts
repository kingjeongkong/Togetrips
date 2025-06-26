import type { FormErrors, SignUpFormData } from '@/features/auth/types/auth';
import { validateSignUpForm } from '@/features/auth/utils/auth-validators';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

export const useAuth = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [authError, setAuthError] = useState('');

  // Google 로그인
  const handleGoogleSignIn = async () => {
    setAuthError('');
    setIsLoading(true);

    try {
      await signIn('google', { callbackUrl: '/home' });
    } catch {
      setAuthError('An error occurred during Google sign in.');
    } finally {
      setIsLoading(false);
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
      } else {
        router.push('/home');
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred during sign in.';
      setAuthError(errorMessage);
    } finally {
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
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    errors,
    authError,
    session,
    handleGoogleSignIn,
    handleSignUp,
    handleSignIn,
    handleSignOut,
  };
};
