import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from '@firebase/auth';
import { auth } from '../../config/firebase';

import AuthLayout from '../../components/Auth/AuthLayout';
import InputField from '../../components/Auth/InputField';
import SubmitButton from '../../components/Auth/SubmitButton';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [authError, setAuthError] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (validationForm()) {
      setIsLoading(true);

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log('Successfully signed up:', userCredential.user);
        navigate('/');
      } catch (error: any) {
        console.log('Error code:', error.code);
        console.log('Error message:', error.message);

        switch (error.code) {
          case 'auth/email-already-in-use':
            setAuthError('Email already in use');
            break;
          default:
            setAuthError('An error occurred. Please try again.');
            break;
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <AuthLayout title="Sign Up">
      <form onSubmit={handleSubmit}>
        <InputField
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fieldError={nameError}
        />
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
        />
        <InputField
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fieldError={confirmPasswordError}
          authError={authError}
          isLast={true}
        />
        {authError && (
          <p className="text-red-500 text-sm mb-2 pl-1">{authError}</p>
        )}
        <SubmitButton title="Sign Up" isLoading={isLoading} />
      </form>

      <p className="text-center mt-6 text-gray-600">
        Already have an account?
        <Link to="/" className="text-indigo-600 ml-4">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignUpPage;
