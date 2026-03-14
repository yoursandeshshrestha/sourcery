import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  role: 'INVESTOR' | 'SOURCER' | 'ADMIN';
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'CANCELLED' | null;

  // Basic info
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  bio: string | null;
  avatar_url: string | null;

  // Sourcer-specific fields
  id_document_url: string | null;
  aml_document_url: string | null;
  insurance_document_url: string | null;
  stripe_connected_account_id: string | null;
  stripe_onboarding_completed: boolean;

  // Investor-specific fields
  stripe_customer_id: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 [AuthContext] Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('📦 [AuthContext] Profile fetch result:', { data, error });

      if (error) {
        throw error;
      }

      if (!data) {
        // Profile doesn't exist - could be:
        // 1. New user (profile trigger still running)
        // 2. Database was reset but user session persists
        console.log('⚠️ [AuthContext] No profile found, waiting 2s for trigger...');

        // Wait briefly for the profile creation trigger
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Try one more time
        const { data: retryData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (!retryData) {
          // Still no profile - database was likely reset
          console.log('🚫 [AuthContext] Profile still missing after retry, signing out...');
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          setSession(null);
          return;
        }

        setProfile(retryData as UserProfile);
        console.log('✅ [AuthContext] Profile set after retry');
        return;
      }

      // data will be null if profile doesn't exist (user needs to complete onboarding)
      setProfile(data as UserProfile | null);
      console.log('✅ [AuthContext] Profile set:', data ? 'Profile exists' : 'No profile');
    } catch (error) {
      console.error('❌ [AuthContext] Error fetching user profile:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    console.log('🚀 [AuthContext] Initializing auth state');

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📡 [AuthContext] Initial session:', session ? `User: ${session.user.email}` : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
      console.log('⏱️ [AuthContext] Initial loading complete');
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 [AuthContext] Auth state changed:', event, session ? `User: ${session.user.email}` : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        console.log('🚫 [AuthContext] No session, profile cleared');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    console.log('🔑 [AuthContext] Initiating Google OAuth sign-in');
    console.log('🔗 [AuthContext] Redirect URL:', `${window.location.origin}/auth/callback`);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error('❌ [AuthContext] OAuth error:', error);
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signInWithGoogle,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
