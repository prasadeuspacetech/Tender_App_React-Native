// src/store/useAuthStore.js
//
// Persisted subscription session (Firebase activation).
// SQLite work data is independent — clearSession does not touch works.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { isSubscriptionExpired } from '../services/subscriptionService';

const EMPTY_SESSION = {
  isActivated: false,
  userId: null,
  name: '',
  mobile: '',
  email: '',
  subscriptionKey: '',
  expiresAt: null,
  durationValue: null,
  durationUnit: null,
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      ...EMPTY_SESSION,
      _hasHydrated: false,

      setHasHydrated: (value) => set({ _hasHydrated: value }),

      setSession: (userData, subscription) =>
        set({
          isActivated: true,
          userId: userData?.id ?? null,
          name: userData?.name ?? '',
          mobile: userData?.mobile ?? '',
          email: userData?.email ?? '',
          subscriptionKey: subscription?.key ?? '',
          expiresAt: subscription?.expiresAt ?? null,
          durationValue: subscription?.durationValue ?? null,
          durationUnit: subscription?.durationUnit ?? null,
        }),

      clearSession: () => set({ ...EMPTY_SESSION }),

      isSessionValid: () => {
        const state = get();
        if (!state.isActivated || !state.expiresAt) return false;
        return !isSubscriptionExpired(state.expiresAt);
      },

      getUserData: () => {
        const { userId, name, mobile, email } = get();
        return { id: userId, name, mobile, email };
      },

      getSubscription: () => {
        const {
          subscriptionKey,
          expiresAt,
          durationValue,
          durationUnit,
        } = get();
        return {
          key: subscriptionKey,
          expiresAt,
          durationValue,
          durationUnit,
        };
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isActivated: state.isActivated,
        userId: state.userId,
        name: state.name,
        mobile: state.mobile,
        email: state.email,
        subscriptionKey: state.subscriptionKey,
        expiresAt: state.expiresAt,
        durationValue: state.durationValue,
        durationUnit: state.durationUnit,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[useAuthStore] rehydrate failed:', error);
        }
        useAuthStore.setState({ _hasHydrated: true });
      },
    },
  ),
);

export default useAuthStore;
