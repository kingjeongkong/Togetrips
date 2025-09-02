'use client';

import { oneSignalClient } from '@/lib/onesignal/client';
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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(() => createBrowserSupabaseClient());

  const isAuthenticated = useMemo(() => !!user, [user]);
  const userId = useMemo(() => user?.id, [user]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user ?? null);

        if (user) {
          oneSignalClient.setUserId(user.id);
          oneSignalClient.syncSubscriptionState();
        }
      } else {
        setUser(null);
        oneSignalClient.logout();
      }

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
