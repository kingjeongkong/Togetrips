export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData extends SignInFormData {
  name: string;
  confirmPassword: string;
}

export interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
}
