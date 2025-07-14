'use client';

import { createBrowserSupabaseClient } from '@/lib/supabase-config';
import { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface SessionContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | undefined;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserSupabaseClient();

  // 메모이제이션으로 성능 최적화
  const isAuthenticated = useMemo(() => !!user, [user]);
  const userId = useMemo(() => user?.id, [user]);

  useEffect(() => {
    // 초기 세션 가져오기
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      let verifiedUser: User | null = null;
      if (session?.access_token) {
        const { data, error } = await supabase.auth.getUser(session.access_token);
        if (!error) {
          verifiedUser = data.user;
        }
      }
      setUser(verifiedUser);
      setIsLoading(false);
    };

    getInitialSession();

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      let verifiedUser: User | null = null;
      if (session?.access_token) {
        const { data, error } = await supabase.auth.getUser(session.access_token);
        if (!error) {
          verifiedUser = data.user;
        }
      }
      setUser(verifiedUser);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticated,
      userId,
    }),
    [user, session, isLoading, isAuthenticated, userId],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
