import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { roleToTier, type Tier } from '../services/tierService';

/**
 * profiles row shape (see supabase/migrations/0001_moodoor_and_app_tables.sql
 * and the pre-existing profiles table it builds on). Unlike the old Firebase
 * version, this app never needs to create the profile itself — the
 * on_auth_user_created trigger (handle_new_user()) already inserts one for
 * every new auth.users row.
 */
interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: 'owner' | 'admin' | 'client';
  tier: Tier;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(currentUser: User) {
    const { data, error } = await supabase
      .from('profiles')
      .select('email, full_name, role')
      .eq('id', currentUser.id)
      .single();

    if (error || !data) {
      console.error('Failed to load profile:', error);
      setUserData(null);
      return;
    }

    setUserData({
      uid: currentUser.id,
      email: data.email ?? currentUser.email ?? '',
      displayName: data.full_name ?? '',
      role: data.role,
      tier: roleToTier(data.role),
    });
  }

  useEffect(() => {
    let isMounted = true;

    async function handleSession(session: Session | null) {
      if (!isMounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile(session.user);
      } else {
        setUserData(null);
      }
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data }) => handleSession(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      void handleSession(session);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
