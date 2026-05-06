import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const SupabaseAuthContext = createContext(null);

export function SupabaseAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user || !isSupabaseConfigured()) {
      setProfile(null);
      return;
    }
    supabase
      .from('users_profile')
      .select('id, display_name, email, is_team')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [session]);

  const signInWithMagicLink = useCallback(async (email, redirectTo) => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    return supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo || window.location.origin + '/comunidade/foro' },
    });
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    await supabase.auth.signOut();
  }, []);

  return (
    <SupabaseAuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        profile,
        loading,
        isAuthed: Boolean(session?.user),
        isAdmin: Boolean(profile?.is_team),
        signInWithMagicLink,
        signOut,
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const ctx = useContext(SupabaseAuthContext);
  if (!ctx) throw new Error('useSupabaseAuth must be used inside SupabaseAuthProvider');
  return ctx;
}
