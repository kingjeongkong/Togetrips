import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from '@firebase/auth';
import { auth } from '../../config/firebase';

import AuthLayout from '../../components/Auth/AuthLayout';
import InputField from '../../components/Auth/InputField';
import SubmitButton from '../../components/Auth/SubmitButton';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');

  const validationForm = (): boolean => {
    let isValid = true;

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Invalid email format');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationForm()) {
      try {
        console.log('Sign in attempt with email:', email);
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log('Successfully signed in:', userCredential.user);
      } catch (error: any) {
        console.log('Error code:', error.code); // Add this log
        console.log('Error message:', error.message); // Add this log

        if (error.code === 'auth/invalid-credential') {
          setAuthError('Invalid email or password');
        } else {
          setAuthError('An error occurred. Please try again.');
        }
      }
    }
  };

  return (
    <AuthLayout title="Sign in">
      <form onSubmit={handleSubmit}>
        <InputField
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fieldError={emailError}
          authError={authError}
        />
        <InputField
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fieldError={passwordError}
          authError={authError}
          isLast={true}
        />
        {authError && (
          <p className="text-red-500 text-sm mb-1 pl-1">{authError}</p>
        )}
        <SubmitButton title="Sign In" />
      </form>

      <div className="flex items-center justify-between mt-6">
        <Link to="#" className="text-indigo-600 hover:underline">
          Forgot password?
        </Link>
        <Link to="/sign-up" className="text-indigo-600 hover:underline">
          Don't have an account?
        </Link>
      </div>
    </AuthLayout>
  );
};

export default SignInPage;
