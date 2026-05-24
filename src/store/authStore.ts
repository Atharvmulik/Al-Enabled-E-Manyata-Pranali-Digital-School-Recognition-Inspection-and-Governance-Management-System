import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '@/types';
import { getAuthData, clearAuthData } from '@/lib/authStorage';

interface AuthStore extends AuthState {
  isHydrated: boolean;                                              // true once persist has re-hydrated AND checkAuth has run
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  refreshSession: () => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => void;
  checkAuth: () => Promise<void>;                                   // call on app startup to validate stored session
}

const dummyUser: User = {
  id: 'officer-001',
  name: 'Inspector Rajesh Kumar',
  email: 'rajesh.kumar@gov.in',
  badgeNumber: 'INS-2024-001',
  department: 'School Inspection Division',
  phone: '+91 98765 43210',
  profileImage: 'https://i.pravatar.cc/150?u=officer-001',
  role: 'officer',
  isActive: true,
  lastLogin: new Date().toISOString(),
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,          // starts false; set to true once checkAuth completes
      token: null,
      refreshToken: null,
      sessionExpiry: null,

      login: async (email: string, password: string, rememberMe: boolean) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Validate credentials (dummy validation)
        if (email === 'rajesh.kumar@gov.in' && password === 'password123') {
          const sessionExpiry = new Date();
          sessionExpiry.setHours(sessionExpiry.getHours() + 8); // 8 hour session
          
          set({
            user: dummyUser,
            isAuthenticated: true,
            token: 'dummy-jwt-token-' + Date.now(),
            refreshToken: 'dummy-refresh-token-' + Date.now(),
            sessionExpiry: sessionExpiry.toISOString(),
            isLoading: false,
          });
        } else {
          set({ isLoading: false });
          throw new Error('Invalid credentials. Please try again.');
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          token: null,
          refreshToken: null,
          sessionExpiry: null,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      refreshSession: async () => {
        const sessionExpiry = new Date();
        sessionExpiry.setHours(sessionExpiry.getHours() + 8);
        
        set({
          token: 'refreshed-jwt-token-' + Date.now(),
          sessionExpiry: sessionExpiry.toISOString(),
        });
      },

      setBiometricEnabled: (enabled: boolean) => {
        // Store biometric preference
      },

      /**
       * Called once on app startup (from AppNavigator or App.tsx).
       * Reads the token from AsyncStorage via authStorage, verifies it hasn't
       * expired, and either restores the session or clears stale data.
       * Sets isHydrated=true when complete so the navigator can safely render.
       */
      checkAuth: async () => {
        try {
          const { token, user } = await getAuthData();

          if (!token || !user) {
            // No stored session — stay logged out
            set({ isAuthenticated: false, isHydrated: true });
            return;
          }

          // Check session expiry stored by the Zustand persist layer
          const expiry = get().sessionExpiry;
          if (expiry && new Date() > new Date(expiry)) {
            // Session expired — clear everything
            await clearAuthData();
            set({
              user: null,
              isAuthenticated: false,
              token: null,
              refreshToken: null,
              sessionExpiry: null,
              isHydrated: true,
            });
            return;
          }

          // Valid session — restore it
          set({ isAuthenticated: true, isHydrated: true });
        } catch {
          // On any error default to logged-out state
          set({ isAuthenticated: false, isHydrated: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // ⚠️  Do NOT persist isAuthenticated — always re-derive it via checkAuth().
      // Persisting isAuthenticated: true was the root cause of bypassing Login.
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        sessionExpiry: state.sessionExpiry,
      }),
    }
  )
);
