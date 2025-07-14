'use client';

import AuthLayout from '@/features/auth/components/AuthLayout';
import InputField from '@/features/auth/components/InputField';
import SubmitButton from '@/features/auth/components/SubmitButton';
import { useAuthActions } from '@/hooks/useAuthActions';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useState } from 'react';

function SignInForm() {
  const { isLoading, isRedirecting, authError, errors, handleSignIn, handleGoogleSignIn } =
    useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSignIn(email, password);
  };

  return (
    <AuthLayout title="Sign in">
      {/* 리다이렉트 중일 때 인라인 로딩 메시지 */}
      {isRedirecting && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-blue-700 text-sm font-medium">Signing you in...</span>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <InputField
          type="email"
          ariaLabel="Email Address"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fieldError={errors.email}
          authError={authError}
        />
        <InputField
          type="password"
          ariaLabel="Password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fieldError={errors.password}
          authError={authError}
          isLast
        />
        <SubmitButton title="Sign In" isLoading={isLoading} />
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Image src="/google-logo.png" alt="Google" width={20} height={20} className="mr-2" />
            Google
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
