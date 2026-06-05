// Step 11: Bill Submission (final workflow step)

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import Inputboxfield from '../../../components/Inputboxfield';
import ProgressSlot from '../../../components/layouts/Progressslot';
import ScreenLayout from '../../../components/layouts/Screenlayout';
import WorkflowProgress from '../../../components/layouts/Workflowprogress';
import NativeDateField from '../../../components/NativeDateField';
import PrimaryButton from '../../../components/PrimaryButton';
import BillDocumentUpload from '../../../components/workflow/BillDocumentUpload';
import BillSubmissionToggle from '../../../components/workflow/BillSubmissionToggle';
import {
  getStepByRoute,
  TOTAL_WORKFLOW_STEPS,
  WORKFLOW_ROUTES,
} from '../../../constants/WorkflowSteps';
import {
    getBillSubmissionByWorkId,
    mapBillSubmissionRowToForm,
    upsertBillSubmission,
} from '../../../db/repositories/billSubmissionRepository';
import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowAutoSave from '../../../hooks/useWorkflowAutoSave';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
import useDraftStore from '../../../store/useDraftStore';
import useWorkStore from '../../../store/useWorkStore';
import theme from '../../../theme';
import { formatDateForStorage } from '../../../utils/dateFormat';

const STEP = getStepByRoute(WORKFLOW_ROUTES.BILL_SUBMISSION)?.id ?? 11;

const EMPTY_FORM = {
  bill_submitted: false,
  bill_number: '',
  bill_date: '',
  bill_document: '',
};

const BillSubmissionWorkflowScreen = ({ navigation }) => {
  useWorkflowStepGuard(WORKFLOW_ROUTES.BILL_SUBMISSION, navigation);

  const getDraft = useDraftStore((s) => s.getDraft);
  const setDraft = useDraftStore((s) => s.setDraft);
  const replaceDraft = useDraftStore((s) => s.replaceDraft);
  const clearAllDrafts = useDraftStore((s) => s.clearAllDrafts);
  const { currentWorkId, clearCurrentWork } = useWorkStore();
  const [form, setForm] = useState(EMPTY_FORM);
  const { bindForm, scheduleDebouncedSave, saveImmediately } = useWorkflowAutoSave('billSubmission');

  useEffect(() => {
    bindForm(form);
  }, [form, bindForm]);

  useEffect(() => {
    const hydrate = () => {
      if (currentWorkId) {
        try {
          const row = getBillSubmissionByWorkId(currentWorkId);
          const hydrated = mapBillSubmissionRowToForm(row);
          if (hydrated) {
            setForm(hydrated);
            bindForm(hydrated);
            queueMicrotask(() => replaceDraft('billSubmission', hydrated, currentWorkId));
            return;
          }
        } catch (e) {
          console.warn('[BillSubmission] hydration error:', e);
        }
      }

      const draft = getDraft('billSubmission', currentWorkId);
      if (draft && Object.keys(draft).length > 0) {
        const merged = {
          bill_submitted: Boolean(draft.bill_submitted),
          bill_number: draft.bill_number ?? '',
          bill_date: formatDateForStorage(draft.bill_date),
          bill_document: draft.bill_document ?? '',
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
          setDraft('billSubmission', updated, workId ?? undefined);
          bindForm(updated);
          if (immediate) saveImmediately();
          else scheduleDebouncedSave();
        });
        return updated;
      });
    },
    [currentWorkId, setDraft, bindForm, scheduleDebouncedSave, saveImmediately],
  );

  const handleToggle = useCallback(() => {
    updateField('bill_submitted', !form.bill_submitted, { immediate: true });
  }, [form.bill_submitted, updateField]);

  const { saveAndContinue, isSaving } = useSaveAndContinue(
    'billSubmission',
    async (workId, data) => {
      upsertBillSubmission(workId, data);
      clearAllDrafts();
      clearCurrentWork();
      return workId;
    },
    WORKFLOW_ROUTES.ADD_WORK,
    WORKFLOW_ROUTES.BILL_SUBMISSION,
  );

  const handleSubmit = () => {
    saveAndContinue(form, navigation, {
      onValidationFail: (m) => Alert.alert('Save Failed', m),
    });
  };

  return (
    <ScreenLayout
      title="Bill Submission"
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
        title="Bill Submission"
        description="Payment is not pay"
        screenType="billSubmission"
        statusType="error"
      />

      <View style={styles.form}>
        <BillSubmissionToggle value={form.bill_submitted} onToggle={handleToggle} />

        {form.bill_submitted ? (
          <>
            <Inputboxfield
              label="Bill number"
              placeholder="Bill number"
              type="alphanumeric"
              value={form.bill_number}
              onChangeText={(v) => updateField('bill_number', v)}
            />
            <NativeDateField
              label="Bill date"
              placeholder="dd/mm/yy"
              value={form.bill_date}
              onDateChange={(date) =>
                updateField('bill_date', formatDateForStorage(date), { immediate: true })
              }
            />
          </>
        ) : null}

        <BillDocumentUpload
          workId={currentWorkId}
          filePath={form.bill_document}
          onChange={(path) => updateField('bill_document', path, { immediate: true })}
        />
      </View>

      <PrimaryButton
        title="Submit"
        loading={isSaving}
        fullWidth
        style={styles.cta}
        onPress={handleSubmit}
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

export default BillSubmissionWorkflowScreen;
