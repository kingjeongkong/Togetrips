export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData extends SignInFormData {
  name: string;
  confirmPassword: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}
