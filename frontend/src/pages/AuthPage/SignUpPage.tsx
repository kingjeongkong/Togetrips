import React, { useState } from 'react';
import AuthLayout from '../../components/Auth/AuthLayout';

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validationForm = (): boolean => {
    let isValid = true;

    if (!name) {
      setNameError('Name is required');
      isValid = false;
    } else {
      setNameError('');
    }

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

    if (!confirmPassword) {
      setConfirmPasswordError('Confirm Password is required');
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationForm()) {
      console.log('Sign up attempt');
    }
  };

  return (
    <AuthLayout title="Sign Up">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
            nameError ? 'border-red-500' : 'border-gray-400 mb-2'
          }`}
        />
        {nameError && (
          <p className="text-red-500 text-sm mb-1 pl-1">{nameError}</p>
        )}
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
            emailError ? 'border-red-500' : 'border-gray-400 mb-2'
          }`}
        />
        {emailError && (
          <p className="text-red-500 text-sm mb-1 pl-1">{emailError}</p>
        )}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
            passwordError ? 'border-red-500' : 'border-gray-400 mb-2'
          }`}
        />
        {passwordError && (
          <p className="text-red-500 text-sm mb-1 pl-1">{passwordError}</p>
        )}
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
            confirmPasswordError ? 'border-red-500' : 'border-gray-400 mb-6'
          }`}
        />
        {confirmPasswordError && (
          <p className="text-red-500 text-sm mb-4 pl-1">
            {confirmPasswordError}
          </p>
        )}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
        >
          Sign Up
        </button>
      </form>
      <p className="text-center mt-6 text-gray-600">
        Already have an account?{' '}
        <a href="/" className="text-indigo-600">
          Sign In
        </a>
      </p>
    </AuthLayout>
  );
};

export default SignUpPage;
