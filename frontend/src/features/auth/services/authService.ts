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
          message:
            error.code === 'auth/email-already-in-use'
              ? 'Email already in use'
              : 'An error occurred during sign up'
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
          message:
            error.code === 'auth/invalid-credential'
              ? 'Invalid email or password'
              : 'An error occurred during sign in'
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
