// Auth hook for Supabase authentication
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { handleUserSignIn, getCurrentAppUser, isAdminEmail } from '../lib/admin';
import type { AppUser } from '../lib/storage/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  appUser: AppUser | null;
  loading: boolean;
  isConfigured: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshAppUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(getCurrentAppUser());
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  // Check if current user is admin
  const isAdmin = appUser?.isAdmin || (user?.email ? isAdminEmail(user.email) : false);

  // Refresh app user from storage
  const refreshAppUser = () => {
    setAppUser(getCurrentAppUser());
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Capture email and create/update app user on initial load
      if (session?.user) {
        const capturedUser = handleUserSignIn(
          session.user.id,
          session.user.email || '',
          session.user.user_metadata?.full_name,
          session.user.user_metadata?.avatar_url
        );
        setAppUser(capturedUser);
      }

      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Capture email on sign-in events
        if (event === 'SIGNED_IN' && session?.user) {
          const capturedUser = handleUserSignIn(
            session.user.id,
            session.user.email || '',
            session.user.user_metadata?.full_name,
            session.user.user_metadata?.avatar_url
          );
          setAppUser(capturedUser);
        }

        // Clear app user on sign out
        if (event === 'SIGNED_OUT') {
          setAppUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });

    if (error) throw error;
  };

  const signOut = async () => {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        appUser,
        loading,
        isConfigured,
        isAdmin,
        signInWithGoogle,
        signOut,
        refreshAppUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
