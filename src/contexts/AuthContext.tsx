
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthUser extends User {
  name?: string;
  phone?: string;
  address?: string;
  panCard?: string;
  aadharCard?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  redirectAfterLogin: string | undefined;
  setRedirectAfterLogin: (path: string | undefined) => void;
  sendOTP: (phone: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (phone: string, otp: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  testLogin: (phone: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userData: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Store test users globally to persist across sessions
const testUsers = new Map<string, any>();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user as AuthUser || null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user as AuthUser || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const sendOTP = async (phone: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const formattedPhone = phone.startsWith('+') ? phone : '+91' + phone;
      
      // Call our custom edge function for real-time OTP
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: formattedPhone }
      });

      if (error) {
        return { success: false, error: error.message || 'Failed to send OTP' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to send OTP' };
    }
  };

  const verifyOTP = async (phone: string, otp: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const formattedPhone = phone.startsWith('+') ? phone : '+91' + phone;
      
      // Call our custom edge function for real-time OTP verification
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone: formattedPhone, otp: otp, name: name || 'User' }
      });

      if (error) {
        return { success: false, error: error.message || 'Failed to verify OTP' };
      }

      if (!data?.success) {
        return { success: false, error: data?.error || 'Invalid OTP' };
      }

      // Set session if returned
      if (data.session) {
        // Set the session in Supabase client for authenticated API calls
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
        setSession(data.session);
        setUser(data.user as AuthUser);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to verify OTP' };
    }
  };

  const testLogin = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if test user already exists
      let testUser = testUsers.get(phone);
      
      if (!testUser) {
        // Create a real test user in Supabase Auth
        try {
          const testEmail = `test_${phone.replace('+', '')}@test.agricaptain.com`;
          const testPassword = 'testuser123';
          
          const { data, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
              data: {
                name: 'Test User',
                phone: phone
              }
            }
          });
          
          if (signUpError && !signUpError.message.includes('User already registered')) {
            throw signUpError;
          }
          
          // Now sign in with the test user
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
          });
          
          if (signInError) {
            throw signInError;
          }
          
          testUser = signInData.user;
          testUsers.set(phone, testUser);
          
        } catch (authError) {
          return { success: false, error: 'Test authentication not available. Please use real OTP or configure test auth properly.' };
        }
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Test login failed' };
    }
  };

  const updateUser = async (userData: Partial<AuthUser>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          pan_card: userData.panCard,
          aadhar_card: userData.aadharCard,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Update local user state
      const updatedUser = {
        ...user,
        ...userData
      };
      setUser(updatedUser);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setRedirectAfterLogin(undefined);
    } catch (error) {
      // Silently handle logout errors
    }
  };

  const value = {
    user,
    session,
    loading,
    redirectAfterLogin,
    setRedirectAfterLogin,
    sendOTP,
    verifyOTP,
    testLogin,
    updateUser,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
