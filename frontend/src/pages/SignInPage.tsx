import React, { useState } from 'react';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationForm()) {
      console.log('Login attempt with', { email, password });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white p-10 rounded-lg shadow-lg">
        <h2 className="text-2xl text-center font-bold mb-6">
          Sign in to your account
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`block p-2 w-full border border-gray-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
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
            className={`block p-2 w-full border border-gray-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
              passwordError ? 'border-red-500' : 'border-gray-400 mb-6'
            }`}
          />
          {passwordError && (
            <p className="text-red-500 text-sm mb-4 pl-1">{passwordError}</p>
          )}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Sign in
          </button>
        </form>
        <div className="flex items-center justify-between mt-6">
          <a href="#" className="text-indigo-600 hover:underline">
            Forgot password?
          </a>
          <a href="#" className="text-indigo-600 hover:underline">
            Don't have an account?
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
