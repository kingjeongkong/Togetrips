'use client';

import { createBrowserSupabaseClient } from '@/lib/supabase-config';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

export const useAuthActions = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
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
    setIsLoading(true);
    setIsRedirecting(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${getCallbackUrl()}`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error occurred while logging in with Google';
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
      const errorMessage =
        error instanceof Error ? error.message : 'Error occurred while signing up';
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
      const errorMessage =
        error instanceof Error ? error.message : 'Error occurred while logging in';
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
      const errorMessage =
        error instanceof Error ? error.message : 'Error occurred while logging out';
      setAuthError(errorMessage);
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isRedirecting,
    authError,
    handleGoogleSignIn,
    handleSignUp,
    handleSignIn,
    handleSignOut,
  };
};
