import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AdminAuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    session: null,
    isAdmin: false,
    isLoading: true,
    error: null,
  });

  // Check if user has admin role
  const checkAdminRole = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin',
      });
      
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      
      return data === true;
    } catch (err) {
      console.error('Failed to check admin role:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        // Defer admin check with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(async () => {
            const isAdmin = await checkAdminRole(session.user.id);
            setState(prev => ({
              ...prev,
              isAdmin,
              isLoading: false,
            }));
          }, 0);
        } else {
          setState(prev => ({
            ...prev,
            isAdmin: false,
            isLoading: false,
          }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const isAdmin = await checkAdminRole(session.user.id);
        setState({
          session,
          user: session.user,
          isAdmin,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          session: null,
          user: null,
          isAdmin: false,
          isLoading: false,
          error: null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAdminRole]);

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, error: null, isLoading: true }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setState(prev => ({ ...prev, error: error.message, isLoading: false }));
        return { error };
      }

      if (data.user) {
        const isAdmin = await checkAdminRole(data.user.id);
        if (!isAdmin) {
          await supabase.auth.signOut();
          const adminError = 'Access denied. Admin privileges required.';
          setState(prev => ({ 
            ...prev, 
            error: adminError, 
            isLoading: false,
            user: null,
            session: null,
            isAdmin: false,
          }));
          return { error: { message: adminError } };
        }
      }

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      return { error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({
      user: null,
      session: null,
      isAdmin: false,
      isLoading: false,
      error: null,
    });
  };

  // Get auth headers for edge function calls
  const getAuthHeaders = useCallback(() => {
    return state.session?.access_token
      ? { Authorization: `Bearer ${state.session.access_token}` }
      : {};
  }, [state.session]);

  return {
    ...state,
    signIn,
    signOut,
    getAuthHeaders,
    isAuthenticated: !!state.user && state.isAdmin,
  };
}
