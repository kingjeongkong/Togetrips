import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../features/Auth/services/authService';

import AuthLayout from '../../features/Auth/components/AuthLayout';
import InputField from '../../features/Auth/components/InputField';
import SubmitButton from '../../features/Auth/components/SubmitButton';
import googleLogo from '../../assets/google-logo.png';
import { useAuthSubmit } from '../../features/Auth/hooks/useAuthSubmit';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { isLoading, errors, authError, oAuthError, handleSubmit, handleGoogleSignIn } =
    useAuthSubmit({
      type: 'signIn',
      redirectPath: '/home'
    });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit({ email, password });
  };

  return (
    <AuthLayout title="Sign in">
      <form onSubmit={onSubmit}>
        <InputField
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fieldError={errors.email}
          authError={authError}
        />
        <InputField
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fieldError={errors.password}
          authError={authError}
          isLast={true}
        />
        {authError && <p className="text-red-500 text-sm mb-1 pl-1">{authError}</p>}
        <SubmitButton title="Sign In" isLoading={isLoading} />
      </form>

      <div className="flex items-center justify-between mt-6">
        <Link to="#" className="text-indigo-600 hover:underline">
          Forgot password?
        </Link>
        <Link to="/sign-up" className="text-indigo-600 hover:underline">
          Don't have an account?
        </Link>
      </div>

      <div className="mt-6">
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
          disabled={isLoading}
        >
          <img src={googleLogo} alt="Google" className="w-6 h-6" />
          Continue with Google
        </button>
        <p className="text-red-500 text-sm mt-2 pl-2">{oAuthError || ''}</p>
      </div>
    </AuthLayout>
  );
};

export default SignInPage;
