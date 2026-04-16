import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppStore {
  isOnline: boolean;
  isBiometricEnabled: boolean;
  lastSyncTime: string | null;
  pendingSync: boolean;
  autoLogoutMinutes: number;
  
  // Actions
  setOnlineStatus: (isOnline: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setLastSyncTime: (time: string) => void;
  setPendingSync: (pending: boolean) => void;
  setAutoLogoutMinutes: (minutes: number) => void;
  syncData: () => Promise<void>;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      isOnline: true,
      isBiometricEnabled: false,
      lastSyncTime: null,
      pendingSync: false,
      autoLogoutMinutes: 30,

      setOnlineStatus: (isOnline) => {
        set({ isOnline });
      },


      setBiometricEnabled: (enabled) => {
        set({ isBiometricEnabled: enabled });
      },

      setLastSyncTime: (time) => {
        set({ lastSyncTime: time });
      },

      setPendingSync: (pending) => {
        set({ pendingSync: pending });
      },

      setAutoLogoutMinutes: (minutes) => {
        set({ autoLogoutMinutes: minutes });
      },

      syncData: async () => {
        set({ pendingSync: true });
        
        // Simulate sync process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        set({
          pendingSync: false,
          lastSyncTime: new Date().toISOString(),
        });
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isBiometricEnabled: state.isBiometricEnabled,
        autoLogoutMinutes: state.autoLogoutMinutes,
      }),
    }
  )
);
