import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AuthLayout from '../../features/auth/components/Auth/AuthLayout';
import InputField from '../../features/auth/components/Auth/InputField';
import SubmitButton from '../../features/auth/components/Auth/SubmitButton';
import { FormErrors, SignUpFormData } from '../../features/auth/types/authTypes';
import { validateSignUpForm } from '../../features/auth/utils/validation';
import { authService } from '../../features/auth/services/authService';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [authError, setAuthError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setAuthError('');

    const formData: SignUpFormData = {name, email, password, confirmPassword};
    const validationErrors = validateSignUpForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    const response = await authService.signUp(formData);
    setIsLoading(false);

    if (!response.success) {
      setAuthError(response.error?.message || 'An error occurred.');
      return;
    }

    navigate('/');
  };

  return (
    <AuthLayout title="Sign Up">
      <form onSubmit={handleSubmit}>
        <InputField
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fieldError={errors.name}
        />
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
        />
        <InputField
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fieldError={errors.confirmPassword}
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
