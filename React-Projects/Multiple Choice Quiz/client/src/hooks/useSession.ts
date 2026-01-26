import { useEffect, useCallback } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useAuthStore } from '@/store/authStore';
import { sessionApi } from '@/lib/api';
import { storage, STORAGE_KEYS } from '@/lib/utils';

/**
 * Hook to initialize session on app load
 * Sessions are only created for authenticated users
 */
export function useSessionInit() {
  const { setSession, setLoading, setError, isInitialized, setInitialized, clearSession } =
    useSessionStore();
  const { isAuthenticated, token: authToken } = useAuthStore();

  useEffect(() => {
    const initSession = async () => {
      setLoading(true);

      try {
        // If not authenticated, clear any existing session and don't create new one
        if (!isAuthenticated) {
          storage.remove(STORAGE_KEYS.SESSION_TOKEN);
          clearSession();
          setInitialized(true);
          setLoading(false);
          return;
        }

        // For authenticated users, check for existing session token
        const existingToken = storage.get<string>(STORAGE_KEYS.SESSION_TOKEN);

        if (existingToken) {
          // Validate existing session
          const result = await sessionApi.validate(existingToken);
          
          if (result.valid && result.session) {
            setSession({
              token: existingToken,
              expiresAt: new Date(result.session.expiresAt),
            });
            setInitialized(true);
            setLoading(false);
            return;
          }
        }

        // Create new session for authenticated user
        const newSession = await sessionApi.create();
        storage.set(STORAGE_KEYS.SESSION_TOKEN, newSession.sessionToken);
        setSession({
          token: newSession.sessionToken,
          expiresAt: new Date(newSession.expiresAt),
        });
        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        setError('Failed to initialize session');
        setInitialized(true); // Still mark as initialized to prevent infinite loop
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, [isAuthenticated, setSession, setLoading, setError, setInitialized, clearSession]);
}

/**
 * Hook to get current session
 */
export function useSession() {
  const { session, isLoading, error, isInitialized } = useSessionStore();
  const { isAuthenticated } = useAuthStore();

  const refreshSession = useCallback(async () => {
    if (!session?.token || !isAuthenticated) return;

    try {
      const result = await sessionApi.validate(session.token);
      if (!result.valid) {
        // Session expired, create new one
        const newSession = await sessionApi.create();
        storage.set(STORAGE_KEYS.SESSION_TOKEN, newSession.sessionToken);
        useSessionStore.getState().setSession({
          token: newSession.sessionToken,
          expiresAt: new Date(newSession.expiresAt),
        });
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  }, [session?.token, isAuthenticated]);

  return {
    session,
    isLoading,
    error,
    isInitialized,
    refreshSession,
    sessionToken: session?.token || null,
  };
}
