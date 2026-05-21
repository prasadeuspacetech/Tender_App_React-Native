// src/store/useUIStore.js
//
// Ephemeral UI state: loading flags, workflow step tracking, filters.
// Intentionally reset on app restart — NOT persisted.

import { create } from 'zustand';

const useUIStore = create((set) => ({
  // ─── State ──────────────────────────────────────────────────────────────────
  isSaving: false,          // true while SQLite write is in progress
  isInitializing: true,     // true while DB is booting at app start
  currentWorkflowStep: 1,   // mirrors works.workflow_step for progress bar
  activeFilters: {},        // Works list screen filter state

  // ─── Actions ─────────────────────────────────────────────────────────────────
  setSaving: (bool) => set({ isSaving: bool }),

  setInitializing: (bool) => set({ isInitializing: bool }),

  setWorkflowStep: (step) => set({ currentWorkflowStep: step }),

  setFilters: (filters) => set({ activeFilters: filters }),

  resetFilters: () => set({ activeFilters: {} }),
}));

export default useUIStore;