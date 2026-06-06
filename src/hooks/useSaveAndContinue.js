// src/hooks/useSaveAndContinue.js
//
// Bridge: form → SQLite → advance workflow_step → navigate.
//
//   screenKey    — useDraftStore key
//   persistFn    — async (workId, formData) => workId
//   nextRoute    — where to go after save
//   currentRoute — THIS screen's route (used to mark completed step id)

import { useCallback } from 'react';
import useWorkStore from '../store/useWorkStore';
import useDraftStore from '../store/useDraftStore';
import useUIStore from '../store/useUIStore';
import { advanceWorkflowStep } from '../db/repositories/worksRepository';
import { getStepByRoute } from '../constants/WorkflowSteps';
import { translatePersistError } from '../i18n/persistErrors';

const useSaveAndContinue = (screenKey, persistFn, nextRoute, currentRoute) => {
  const { currentWorkId, setCurrentWorkId, refreshCurrentWork } = useWorkStore();
  const { clearDraft } = useDraftStore();
  const { isSaving, setSaving } = useUIStore();

  const saveAndContinue = useCallback(
    async (formData, navigation, options = {}) => {
      const { onValidationFail } = options;

      if (isSaving) return;

      setSaving(true);

      try {
        const persistResult = await persistFn(currentWorkId, formData);

        // Prefer store id when editing — repos must return workId, but never use
        // a child-table row id (e.g. contractors.id) for workflow_step updates.
        const resolvedWorkId = currentWorkId ?? persistResult;

        if (!currentWorkId && persistResult) {
          await setCurrentWorkId(persistResult);
        }

        const completedStepId = currentRoute
          ? getStepByRoute(currentRoute)?.id ?? null
          : null;

        if (resolvedWorkId && completedStepId) {
          advanceWorkflowStep(resolvedWorkId, completedStepId);
        }

        await refreshCurrentWork();
        clearDraft(screenKey, resolvedWorkId ?? undefined);
        navigation.navigate(nextRoute);
      } catch (error) {
        console.error(`[useSaveAndContinue] ${screenKey} save failed:`, error);
        if (typeof onValidationFail === 'function') {
          onValidationFail(translatePersistError(error.message));
        }
      } finally {
        setSaving(false);
      }
    },
    [
      screenKey,
      persistFn,
      nextRoute,
      currentRoute,
      currentWorkId,
      isSaving,
      setSaving,
      setCurrentWorkId,
      refreshCurrentWork,
      clearDraft,
    ],
  );

  return {
    saveAndContinue,
    isSaving,
  };
};

export default useSaveAndContinue;
