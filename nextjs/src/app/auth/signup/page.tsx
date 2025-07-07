'use client';

import AuthLayout from '@/features/auth/components/AuthLayout';
import InputField from '@/features/auth/components/InputField';
import SubmitButton from '@/features/auth/components/SubmitButton';
import { useAuth } from '@/features/auth/hooks/useAuth';
import Link from 'next/link';
import { Suspense, useState } from 'react';

function SignUpForm() {
  const { isLoading, errors, authError, handleSignUp } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSignUp(form);
  };

  return (
    <AuthLayout title="Sign up">
      <form onSubmit={onSubmit}>
        <InputField
          type="text"
          ariaLabel="Full Name"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          fieldError={errors.name}
        />
        <InputField
          type="email"
          ariaLabel="Email Address"
          placeholder="Email Address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          fieldError={errors.email}
        />
        <InputField
          type="password"
          ariaLabel="Password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          fieldError={errors.password}
        />
        <InputField
          type="password"
          ariaLabel="Confirm Password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          fieldError={errors.confirmPassword}
          isLast
        />
        {authError && <p className="text-red-500 text-sm mt-2">{authError}</p>}
        <SubmitButton title="Sign Up" isLoading={isLoading} />
      </form>
      <div className="text-center text-sm mt-6">
        <Link href="/auth/signin" className="text-indigo-500 hover:underline transition">
          Already have an account?
        </Link>
      </div>
    </AuthLayout>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
