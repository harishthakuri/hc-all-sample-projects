import { create } from 'zustand';

interface SessionData {
  token: string;
  expiresAt: Date;
}

interface SessionState {
  session: SessionData | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  setSession: (session: SessionData | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (isInitialized: boolean) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  isLoading: true,
  error: null,
  isInitialized: false,

  setSession: (session) => set({ session, error: null }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error, isLoading: false }),
  
  setInitialized: (isInitialized) => set({ isInitialized }),
  
  clearSession: () =>
    set({
      session: null,
      error: null,
      isInitialized: false,
    }),
}));
