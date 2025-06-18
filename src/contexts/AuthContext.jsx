import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing session on app start
  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({ 
          title: "Login Failed", 
          description: error.message, 
          variant: "destructive" 
        });
        throw error;
      }

      if (data.user) {
        setUser(data.user);
        toast({ 
          title: "Login Successful!", 
          description: `Welcome back, ${data.user.email}!`, 
          variant: "default" 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const signup = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) {
        toast({ 
          title: "Signup Failed", 
          description: error.message, 
          variant: "destructive" 
        });
        throw error;
      }

      if (data.user) {
        toast({ 
          title: "Signup Successful!", 
          description: `Welcome, ${name}! Please check your email to verify your account.`, 
          variant: "default" 
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({ 
          title: "Logout Failed", 
          description: error.message, 
          variant: "destructive" 
        });
        throw error;
      }

      setUser(null);
      toast({ 
        title: "Logged Out", 
        description: "You have been successfully logged out.", 
        variant: "default" 
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateUserProfileContext = useCallback(async (updatedProfileData) => {
    if (!user) throw new Error("User not authenticated");
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updatedProfileData
      });

      if (error) {
        toast({ 
          title: "Profile Update Failed", 
          description: error.message, 
          variant: "destructive" 
        });
        throw error;
      }

      if (data.user) {
        setUser(data.user);
        toast({ 
          title: "Profile Updated", 
          description: "Your profile has been updated." 
        });
      }
      
      return data.user;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const fetchUserProfile = useCallback(() => {
    return user;
  }, [user]);

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    updateUserProfileContext,
    fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;