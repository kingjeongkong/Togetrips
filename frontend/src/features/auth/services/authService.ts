import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  UserCredential
} from '@firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';
import { SignUpFormData, AuthFormData } from '../types/auth.types';

interface AuthResponse {
  success: boolean;
  user?: UserCredential['user'];
  error?: {
    code: string;
    message: string;
  };
}

const getErrorMessage = (code: string): string => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email already in use';
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    default:
      return 'An error occurred. Please try again.';
  }
};

export const authService = {
  async signUp({
    name,
    email,
    password
  }: SignUpFormData): Promise<AuthResponse> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return {
        success: true,
        user: userCredential.user
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code,
          message: getErrorMessage(error.code)
        }
      };
    }
  },

  async signIn({ email, password }: AuthFormData): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      return {
        success: true,
        user: userCredential.user
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code,
          message: getErrorMessage(error.code)
        }
      };
    }
  },

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'An error occurred during sign out' };
    }
  }
};
