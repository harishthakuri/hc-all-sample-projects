import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSessionStore } from '@/store/sessionStore';
import { storage, STORAGE_KEYS } from '@/lib/utils';
import { toast } from './useToast';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function useAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, isAuthenticated, setAuth, clearAuth, setLoading, isLoading } = useAuthStore();
  const { setSession, setInitialized } = useSessionStore();

  // Get the redirect path from location state, default to home
  const getRedirectPath = () => {
    const state = location.state as { from?: string } | null;
    return state?.from || '/';
  };

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }

      // Store auth data
      setAuth(data.data.user, data.data.token);
      
      // Store session token (same as auth token from login)
      storage.set(STORAGE_KEYS.SESSION_TOKEN, data.data.token);
      setSession({
        token: data.data.token,
        expiresAt: new Date(data.data.expiresAt),
      });
      setInitialized(true);
      
      toast({ title: 'Welcome back!', description: `Logged in as ${data.data.user.name}` });
      
      // Redirect to the page they were trying to access
      const redirectPath = getRedirectPath();
      navigate(redirectPath, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setAuth, setLoading, navigate, location.state, setSession, setInitialized]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store auth data
      setAuth(data.data.user, data.data.token);
      
      // Store session token (same as auth token from register)
      storage.set(STORAGE_KEYS.SESSION_TOKEN, data.data.token);
      setSession({
        token: data.data.token,
        expiresAt: new Date(data.data.expiresAt),
      });
      setInitialized(true);
      
      toast({ title: 'Welcome!', description: 'Account created successfully' });
      
      // Redirect to the page they were trying to access
      const redirectPath = getRedirectPath();
      navigate(redirectPath, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setAuth, setLoading, navigate, location.state, setSession, setInitialized]);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth state
      clearAuth();
      
      // Clear session state
      storage.remove(STORAGE_KEYS.SESSION_TOKEN);
      useSessionStore.getState().clearSession();
      
      toast({ title: 'Logged out', description: 'See you next time!' });
      navigate('/');
    }
  }, [token, clearAuth, navigate]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };
}
