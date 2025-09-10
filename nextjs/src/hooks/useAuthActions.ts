'use client';

import { FormErrors } from '@/features/auth/types/auth';
import {
  getErrorMessage,
  validateSignInForm,
  validateSignUpForm,
} from '@/features/auth/utils/auth-validators';
import { createBrowserSupabaseClient } from '@/lib/supabase-config';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

export const useAuthActions = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [authError, setAuthError] = useState('');

  const supabase = createBrowserSupabaseClient();

  // callbackUrl을 가져오는 함수
  const getCallbackUrl = () => {
    const callbackUrl = searchParams.get('callbackUrl');
    return callbackUrl || '/home';
  };

  // Google 로그인
  const handleGoogleSignIn = async () => {
    setAuthError('');
    setErrors({});
    setIsLoading(true);
    setIsRedirecting(true);

    try {
      const redirectUrl = `${window.location.origin}/auth/callback?next=${getCallbackUrl()}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error as Error);
      setAuthError(errorMessage);
      setIsLoading(false);
      setIsRedirecting(false);
    }
  };

  // 이메일/비밀번호 회원가입
  const handleSignUp = async (formData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setAuthError('');
    setErrors({});

    // 폼 검증
    const validationErrors = validateSignUpForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // API Route를 통해 회원가입 처리
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Signup successful!');
        router.push('/auth/signin');
      } else {
        throw new Error(data.message || 'Signup failed.');
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error as Error);
      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 이메일/비밀번호 로그인
  const handleSignIn = async (email: string, password: string) => {
    setAuthError('');
    setErrors({});

    // 폼 검증
    const validationErrors = validateSignInForm({ email, password });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // 로그인 성공 시 리다이렉트
      router.push(getCallbackUrl());
    } catch (error) {
      const errorMessage = getErrorMessage(error as Error);
      setAuthError(errorMessage);
      setIsLoading(false);
    }
  };

  // 로그아웃
  const handleSignOut = async () => {
    setAuthError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      // 로그아웃 성공 시 로그인 페이지로 리다이렉트
      router.push('/auth/signin');
    } catch (error) {
      const errorMessage = getErrorMessage(error as Error);
      setAuthError(errorMessage);
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isRedirecting,
    authError,
    errors,
    handleSignIn,
    handleSignUp,
    handleGoogleSignIn,
    handleSignOut,
  };
};
