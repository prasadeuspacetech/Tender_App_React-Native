// src/screens/AddWork/workflow/WorkDetailsScreen.jsx
// Step 1 of 10: Work Details

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import Inputboxfield from '../../../components/Inputboxfield';
import ProgressSlot from '../../../components/layouts/Progressslot';
import ScreenLayout from '../../../components/layouts/Screenlayout';
import WorkflowProgress from '../../../components/layouts/Workflowprogress';
import PrimaryButton from '../../../components/PrimaryButton';
import {
  TOTAL_WORKFLOW_STEPS,
  WORKFLOW_ROUTES,
} from '../../../constants/WorkflowSteps';
import { getWorkById, upsertWorkDetails } from '../../../db/repositories/worksRepository';
import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowAutoSave from '../../../hooks/useWorkflowAutoSave';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
import useDraftStore from '../../../store/useDraftStore';
import useWorkStore from '../../../store/useWorkStore';
import theme from '../../../theme';

const EMPTY_FORM = {
  work_code: '',
  financial_year: '',
  work_name: '',
  ward: '',
  department: '',
  sub_department: '',
  officer: '',
  budget: '',
};

const WorkDetailsScreen = ({ navigation }) => {
  useWorkflowStepGuard(WORKFLOW_ROUTES.WORK_DETAILS, navigation);

  const getDraft = useDraftStore((s) => s.getDraft);
  const setDraft = useDraftStore((s) => s.setDraft);
  const currentWorkId = useWorkStore((s) => s.currentWorkId);
  const { currentWork } = useWorkStore();

  const [form, setForm] = useState(EMPTY_FORM);
  const { bindForm, scheduleDebouncedSave, saveImmediately } = useWorkflowAutoSave('workDetails');

  useEffect(() => {
    bindForm(form);
  }, [form, bindForm]);

  useEffect(() => {
    if (currentWorkId) {
      try {
        const work = getWorkById(currentWorkId);
        if (work) {
          const hydrated = {
            work_code: work.work_code ?? '',
            financial_year: work.financial_year ?? '',
            work_name: work.work_name ?? '',
            ward: work.ward ?? '',
            department: work.department ?? '',
            sub_department: work.sub_department ?? '',
            officer: work.officer ?? '',
            budget: work.budget != null ? String(work.budget) : '',
          };
          setForm(hydrated);
          bindForm(hydrated);
          queueMicrotask(() => setDraft('workDetails', hydrated));
          return;
        }
      } catch (e) {
        console.warn('[WorkDetails] hydration error:', e);
      }
    }

    const draft = getDraft('workDetails');
    if (Object.keys(draft).length > 0) {
      const merged = { ...EMPTY_FORM, ...draft };
      setForm(merged);
      bindForm(merged);
      return;
    }

    if (currentWork) {
      const hydrated = {
        work_code: currentWork.work_code ?? '',
        financial_year: currentWork.financial_year ?? '',
        work_name: currentWork.work_name ?? '',
        ward: currentWork.ward ?? '',
        department: currentWork.department ?? '',
        sub_department: currentWork.sub_department ?? '',
        officer: currentWork.officer ?? '',
        budget: currentWork.budget != null ? String(currentWork.budget) : '',
      };
      setForm(hydrated);
      bindForm(hydrated);
    }
  }, [currentWorkId]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = useCallback(
    (key, value, { immediate = false } = {}) => {
      setForm((prev) => {
        const updated = { ...prev, [key]: value };
        queueMicrotask(() => {
          setDraft('workDetails', updated);
          bindForm(updated);
          if (immediate) saveImmediately();
          else scheduleDebouncedSave();
        });
        return updated;
      });
    },
    [setDraft, bindForm, scheduleDebouncedSave, saveImmediately],
  );

  const { saveAndContinue, isSaving } = useSaveAndContinue(
    'workDetails',
    (workId, data) =>
      upsertWorkDetails(workId, {
        ...data,
        budget: data.budget ? parseFloat(data.budget) : 0,
      }),
    WORKFLOW_ROUTES.PMC_APPROVAL,
    WORKFLOW_ROUTES.WORK_DETAILS,
  );

  const handleSave = () => {
    saveAndContinue(form, navigation, {
      onValidationFail: (msg) => Alert.alert('Save Failed', msg),
    });
  };

  return (
    <ScreenLayout
      title="Work Details"
      showBack
      showNotification
      scrollable
      keyboardAware
      onBackPress={() => navigation.goBack()}
    >
      <WorkflowProgress
        currentStep={1}
        totalSteps={TOTAL_WORKFLOW_STEPS}
        showPercentage
        style={styles.progress}
      />

      <ProgressSlot
        step={1}
        title="Work Details"
        description="Enter basic work information"
        screenType="workDetails"
      />

      <View style={styles.form}>
        <Inputboxfield
          label="Work Code"
          placeholder="eg. ERK-2025-0001"
          value={form.work_code}
          onChangeText={(v) => updateField('work_code', v)}
        />

        <Inputboxfield
          label="Work Name"
          placeholder="Enter the full name"
          value={form.work_name}
          onChangeText={(v) => updateField('work_name', v)}
        />

        <Inputboxfield
          label="Budget (₹)"
          placeholder="₹15,00,000"
          value={form.budget}
          type="number"
          keyboardType="numeric"
          onChangeText={(v) => updateField('budget', v)}
        />

        <Inputboxfield
          label="Financial Year"
          placeholder="e.g. FY 2025-26"
          value={form.financial_year}
          onChangeText={(v) => updateField('financial_year', v)}
        />

        <Inputboxfield
          label="Ward"
          placeholder="Enter ward"
          value={form.ward}
          onChangeText={(v) => updateField('ward', v)}
        />

        <Inputboxfield
          label="Department"
          placeholder="Enter department"
          value={form.department}
          onChangeText={(v) => updateField('department', v)}
        />

        <Inputboxfield
          label="Sub Department"
          placeholder="Enter sub department"
          value={form.sub_department}
          onChangeText={(v) => updateField('sub_department', v)}
        />

        <Inputboxfield
          label="Officer"
          placeholder="Enter officer name"
          value={form.officer}
          onChangeText={(v) => updateField('officer', v)}
        />
      </View>

      <PrimaryButton
        title="Save & Continue"
        onPress={handleSave}
        loading={isSaving}
        fullWidth
        style={styles.cta}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  progress: { marginBottom: theme.Spacing?.sm ?? 8 },
  form: { marginTop: theme.Spacing?.sm ?? 8 },
  cta: {
    marginTop: theme.Spacing?.lg ?? 24,
    marginBottom: theme.Spacing?.xl ?? 32,
  },
});

export default WorkDetailsScreen;
