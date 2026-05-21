// src/store/useDraftStore.js
//
// Holds unsaved form data for each workflow screen.
// Lives in memory only — intentionally lost on app kill.
//
// Screens may pass workId to scope drafts per work (prevents cross-work leakage).
// Legacy screens omit workId and use a flat object per screenKey.

import { create } from 'zustand';

const INITIAL_DRAFTS = {
  workDetails:           {},
  pmcApproval:           {},
  estimation:            {},
  tenderCreation:        {},
  reTender:              {},
  contractorAssignment:  {},
  sanctionApproval:      {},
  paymentStatus:         {},
};

const toWorkKey = (workId) => {
  if (workId == null || workId === '') return null;
  const n = Number(workId);
  return Number.isFinite(n) && n > 0 ? String(n) : null;
};

const useDraftStore = create((set, get) => ({
  drafts: { ...INITIAL_DRAFTS },

  setDraft: (screenKey, partialData, workId) => {
    const { drafts } = get();
    const prev = drafts[screenKey] ?? {};
    const wk = toWorkKey(workId);

    if (wk) {
      const byWork = { ...(prev.byWork ?? {}) };
      byWork[wk] = { ...(byWork[wk] ?? {}), ...partialData };
      set({
        drafts: {
          ...drafts,
          [screenKey]: { byWork },
        },
      });
      return;
    }

    set({
      drafts: {
        ...drafts,
        [screenKey]: {
          ...prev,
          ...partialData,
        },
      },
    });
  },

  replaceDraft: (screenKey, data, workId) => {
    const { drafts } = get();
    const wk = toWorkKey(workId);

    if (wk) {
      const prev = drafts[screenKey] ?? {};
      const byWork = { ...(prev.byWork ?? {}) };
      byWork[wk] = data ?? {};
      set({
        drafts: {
          ...drafts,
          [screenKey]: { byWork },
        },
      });
      return;
    }

    set({
      drafts: {
        ...drafts,
        [screenKey]: data ?? {},
      },
    });
  },

  clearDraft: (screenKey, workId) => {
    const { drafts } = get();
    const wk = toWorkKey(workId);

    if (wk) {
      const prev = drafts[screenKey] ?? {};
      if (!prev.byWork) return;
      const byWork = { ...prev.byWork };
      delete byWork[wk];
      set({
        drafts: {
          ...drafts,
          [screenKey]: { byWork },
        },
      });
      return;
    }

    set({
      drafts: {
        ...drafts,
        [screenKey]: {},
      },
    });
  },

  clearAllDrafts: () => {
    set({ drafts: { ...INITIAL_DRAFTS } });
  },

  getDraft: (screenKey, workId) => {
    const bucket = get().drafts[screenKey] ?? {};
    const wk = toWorkKey(workId);

    if (wk) {
      if (bucket.byWork && typeof bucket.byWork === 'object') {
        return bucket.byWork[wk] ?? {};
      }
      return {};
    }

    if (bucket.byWork) return {};
    return bucket;
  },
}));

export default useDraftStore;
