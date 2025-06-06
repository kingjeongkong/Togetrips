import { useState } from 'react';
import { SignInFormData, FormErrors, SignUpFormData } from '../types/authTypes';
import { useNavigate } from 'react-router-dom';
import { validateSignInForm, validateSignUpForm } from '../utils/validation';
import { authService } from '../services/authService';

type AuthType = 'signIn' | 'signUp';

interface UseAuthSubmitProps {
  type: AuthType;
  redirectPath: string;
}

export const useAuthSubmit = ({ type, redirectPath }: UseAuthSubmitProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [authError, setAuthError] = useState('');
  const [oAuthError, setOAuthError] = useState('');

  const handleSubmit = async (formData: SignInFormData | SignUpFormData) => {
    setErrors({});
    setAuthError('');

    const validationErrors =
      type === 'signIn'
        ? validateSignInForm(formData as SignInFormData)
        : validateSignUpForm(formData as SignUpFormData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    const response =
      type === 'signIn'
        ? await authService.signIn(formData as SignInFormData)
        : await authService.signUp(formData as SignUpFormData);
    setIsLoading(false);

    if (!response.success) {
      setAuthError(response.error?.message || 'An error occurred.');
      return;
    }

    navigate(redirectPath);
  };

  const handleGoogleSignIn = async () => {
    const response = await authService.signInWithGoogle();

    if (!response.success) {
      setOAuthError(response.error?.message || 'An error occurred.');
      return;
    }

    navigate(redirectPath);
  };

  return {
    isLoading,
    errors,
    authError,
    oAuthError,
    handleSubmit,
    handleGoogleSignIn
  };
};
