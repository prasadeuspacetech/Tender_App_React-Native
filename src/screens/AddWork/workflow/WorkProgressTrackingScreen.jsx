// Step 9: Work Progress Tracking

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import ProgressSlot from '../../../components/layouts/Progressslot';
import ScreenLayout from '../../../components/layouts/Screenlayout';
import WorkflowProgress from '../../../components/layouts/Workflowprogress';
import PrimaryButton from '../../../components/PrimaryButton';
import ReportCategoryChipRow from '../../../components/reports/ReportCategoryChipRow';
import SiteNotes from '../../../components/workflow/SiteNotes';
import SitePhotosUpload from '../../../components/workflow/SitePhotosUpload';
import WorkProgressCompletionCard from '../../../components/workflow/WorkProgressCompletionCard';
import WorkProgressStatusSection from '../../../components/workflow/WorkProgressStatusSection';
import { TOTAL_WORKFLOW_STEPS, WORKFLOW_ROUTES } from '../../../constants/WorkflowSteps';
import {
    getWorkProgressByWorkId,
    mapWorkProgressRowToForm,
    upsertWorkProgress,
} from '../../../db/repositories/workProgressRepository';
import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowAutoSave from '../../../hooks/useWorkflowAutoSave';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
import useDraftStore from '../../../store/useDraftStore';
import useWorkStore from '../../../store/useWorkStore';
import theme from '../../../theme';

const STEP = 9;

const EMPTY_FORM = {
  site_notes: '',
  site_photos: [],
};

const WorkProgressTrackingScreen = ({ navigation }) => {
  useWorkflowStepGuard(WORKFLOW_ROUTES.WORK_PROGRESS, navigation);

  const getDraft = useDraftStore((s) => s.getDraft);
  const setDraft = useDraftStore((s) => s.setDraft);
  const replaceDraft = useDraftStore((s) => s.replaceDraft);
  const { currentWorkId } = useWorkStore();
  const [form, setForm] = useState(EMPTY_FORM);
  const { bindForm, scheduleDebouncedSave, saveImmediately } = useWorkflowAutoSave('workProgress');

  useEffect(() => {
    bindForm(form);
  }, [form, bindForm]);

  useEffect(() => {
    const hydrate = () => {
      if (currentWorkId) {
        try {
          const row = getWorkProgressByWorkId(currentWorkId);
          const hydrated = mapWorkProgressRowToForm(row);
          if (hydrated) {
            setForm(hydrated);
            bindForm(hydrated);
            queueMicrotask(() => replaceDraft('workProgress', hydrated, currentWorkId));
            return;
          }
        } catch (e) {
          console.warn('[WorkProgress] hydration error:', e);
        }
      }

      const draft = getDraft('workProgress', currentWorkId);
      if (draft && (draft.site_notes != null || draft.site_photos?.length)) {
        const merged = {
          site_notes: draft.site_notes ?? '',
          site_photos: Array.isArray(draft.site_photos) ? draft.site_photos : [],
        };
        setForm(merged);
        bindForm(merged);
      }
    };

    hydrate();
  }, [currentWorkId]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = useCallback(
    (key, value, { immediate = false } = {}) => {
      setForm((prev) => {
        const updated = { ...prev, [key]: value };
        const workId = currentWorkId;
        queueMicrotask(() => {
          setDraft('workProgress', updated, workId ?? undefined);
          bindForm(updated);
          if (immediate) saveImmediately();
          else scheduleDebouncedSave();
        });
        return updated;
      });
    },
    [currentWorkId, setDraft, bindForm, scheduleDebouncedSave, saveImmediately],
  );

  const { saveAndContinue, isSaving } = useSaveAndContinue(
    'workProgress',
    (workId, data) => upsertWorkProgress(workId, data),
    WORKFLOW_ROUTES.PAYMENT_STATUS,
    WORKFLOW_ROUTES.WORK_PROGRESS,
  );

  const handleSave = () => {
    saveAndContinue(form, navigation, {
      onValidationFail: (m) => Alert.alert('Save Failed', m),
    });
  };

  return (
    <ScreenLayout
      title="Work Progress Tracking"
      showBack
      showNotification
      scrollable
      keyboardAware
      onBackPress={() => navigation.goBack()}
    >
      <WorkflowProgress
        currentStep={STEP}
        totalSteps={TOTAL_WORKFLOW_STEPS}
        showPercentage
        style={styles.progress}
      />
      <ProgressSlot
        step={STEP}
        title="Work Progress Tracking"
        description="Work order issued / Work started"
        screenType="workProgress"
      />

      <View style={styles.content}>
        <ReportCategoryChipRow style={styles.chips} />
        <WorkProgressCompletionCard />
        <WorkProgressStatusSection />
        <SiteNotes
          value={form.site_notes}
          onChangeText={(v) => updateField('site_notes', v)}
        />
        <SitePhotosUpload
          workId={currentWorkId}
          photos={form.site_photos}
          onChange={(photos) => updateField('site_photos', photos, { immediate: true })}
        />
      </View>

      <PrimaryButton
        title="Save & Continue"
        loading={isSaving}
        fullWidth
        style={styles.cta}
        onPress={handleSave}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  progress: { marginBottom: theme.Spacing?.sm ?? 8 },
  content: {
    marginTop: theme.Spacing?.sm ?? 8,
  },
  chips: {
    marginBottom: 14,
    marginHorizontal: -4,
  },
  cta: {
    marginTop: theme.Spacing?.lg ?? 24,
    marginBottom: theme.Spacing?.xl ?? 32,
  },
});

export default WorkProgressTrackingScreen;
