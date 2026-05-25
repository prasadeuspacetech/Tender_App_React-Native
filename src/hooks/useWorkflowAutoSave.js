/**
 * Debounced + immediate SQLite auto-save for workflow forms.
 * Reuses persistWorkflowStep (same upserts as Save & Continue).
 */

import { useCallback, useEffect, useRef } from 'react';
import useWorkStore from '../store/useWorkStore';
import { persistWorkflowStep } from '../utils/workflowPersist';

const DEBOUNCE_MS = 800;

const useWorkflowAutoSave = (screenKey) => {
  const currentWorkId = useWorkStore((s) => s.currentWorkId);
  const setCurrentWorkId = useWorkStore((s) => s.setCurrentWorkId);
  const refreshCurrentWork = useWorkStore((s) => s.refreshCurrentWork);

  const formRef = useRef(null);
  const timerRef = useRef(null);
  const persistInFlightRef = useRef(false);
  const workIdRef = useRef(currentWorkId);

  workIdRef.current = currentWorkId;

  const bindForm = useCallback((formData) => {
    formRef.current = formData;
  }, []);

  const runPersist = useCallback(
    async (formData) => {
      if (!formData || persistInFlightRef.current) return;

      persistInFlightRef.current = true;
      try {
        const resolvedId = persistWorkflowStep(
          screenKey,
          workIdRef.current,
          formData,
        );

        if (resolvedId == null) return;

        if (!workIdRef.current || workIdRef.current !== resolvedId) {
          await setCurrentWorkId(resolvedId);
          workIdRef.current = resolvedId;
        }

        if (screenKey === 'workDetails') {
          await refreshCurrentWork();
        }
      } catch (error) {
        console.warn(`[useWorkflowAutoSave:${screenKey}]`, error);
      } finally {
        persistInFlightRef.current = false;
      }
    },
    [screenKey, setCurrentWorkId, refreshCurrentWork],
  );

  const scheduleDebouncedSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      const snapshot = formRef.current;
      if (snapshot) runPersist(snapshot);
    }, DEBOUNCE_MS);
  }, [runPersist]);

  const saveImmediately = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const snapshot = formRef.current;
    if (snapshot) return runPersist(snapshot);
    return Promise.resolve();
  }, [runPersist]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        const snapshot = formRef.current;
        if (snapshot) runPersist(snapshot);
      }
    };
  }, [runPersist]);

  return {
    bindForm,
    scheduleDebouncedSave,
    saveImmediately,
  };
};

export default useWorkflowAutoSave;
