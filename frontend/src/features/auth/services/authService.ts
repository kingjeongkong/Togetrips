import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  signInWithPopup
} from '@firebase/auth';
import { GoogleAuthProvider } from '@firebase/auth/internal';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';
import { SignInFormData, SignUpFormData } from '../types/authTypes';

interface AuthResponse {
  success: boolean;
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
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled';
    case 'auth/popup-blocked':
      return 'Popup was blocked by the browser';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address but different sign-in credentials';
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
        image: '',
        tags: '',
        bio: '',
        location: {
          city: '',
          state: ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return {
        success: true
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

  async signIn({ email, password }: SignInFormData): Promise<AuthResponse> {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      return {
        success: true
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

  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const userDoc = doc(db, 'users', result.user.uid);
      const userSnapshot = await getDoc(userDoc);

      if (!userSnapshot.exists()) {
        await setDoc(
          userDoc,
          {
            name: result.user.displayName,
            email: result.user.email,
            image: result.user.image || '',
            tags: '',
            bio: '',
            location: {
              city: '',
              state: ''
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        );
      } 
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code,
          message:
            getErrorMessage(error.code) || 'Failed to sign in with Google'
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
