import { onAuthStateChanged, User } from '@firebase/auth';
import { create } from 'zustand';
import { auth } from '../config/firebase';

interface AuthState {
  user: User | null;
  authLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  authLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, authLoading: false, isAuthenticated: !!user });
    });
    return unsubscribe;
  }
}));
