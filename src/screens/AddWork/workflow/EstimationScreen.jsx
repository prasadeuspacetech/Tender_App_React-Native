// src/screens/AddWork/workflow/EstimationScreen.jsx
// Step 3 of 9: Estimation

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import FormToggleField from '../../../components/FormToggleField';
import Inputboxfield from '../../../components/Inputboxfield';
import ProgressSlot from '../../../components/layouts/Progressslot';
import ScreenLayout from '../../../components/layouts/Screenlayout';
import WorkflowProgress from '../../../components/layouts/Workflowprogress';
import NativeDateField from '../../../components/NativeDateField';
import PrimaryButton from '../../../components/PrimaryButton';
import UploadDocument from '../../../components/UploadDocument';
import { DOCUMENT_TYPES } from '../../../constants/documentTypes';
import useDocumentUpload from '../../../hooks/useDocumentUpload';
import { buildUploadDocumentEntry } from '../../../utils/documentUploadProps';

import { TOTAL_WORKFLOW_STEPS, WORKFLOW_ROUTES } from '../../../constants/WorkflowSteps';
import {
    getEstimationByWorkId,
    mapEstimationRowToForm,
    upsertEstimation,
} from '../../../db/repositories/estimationsRepository';
import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowAutoSave from '../../../hooks/useWorkflowAutoSave';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
import useDraftStore from '../../../store/useDraftStore';
import useWorkStore from '../../../store/useWorkStore';
import theme from '../../../theme';
import { formatDateForStorage } from '../../../utils/dateFormat';

const EMPTY_FORM = {
  estimate_done:    false,
  estimation_date:  '',
  estimated_cost:   '',
  notes:            '',
  estimation_file_path: '',
};

const EstimationScreen = ({ navigation }) => {
  useWorkflowStepGuard(WORKFLOW_ROUTES.ESTIMATION, navigation);

  const getDraft = useDraftStore((s) => s.getDraft);
  const setDraft = useDraftStore((s) => s.setDraft);
  const { currentWorkId } = useWorkStore();

  const [form, setForm] = useState(EMPTY_FORM);
  const { bindForm, scheduleDebouncedSave, saveImmediately } = useWorkflowAutoSave('estimation');

  useEffect(() => {
    bindForm(form);
  }, [form, bindForm]);

  useEffect(() => {
    const hydrate = () => {
      if (currentWorkId) {
        try {
          const row = getEstimationByWorkId(currentWorkId);
          const hydrated = mapEstimationRowToForm(row);
          if (hydrated) {
            setForm(hydrated);
            bindForm(hydrated);
            setDraft('estimation', hydrated);
            return;
          }
        } catch (e) {
          console.warn('[EstimationScreen] hydration failed:', e);
        }
      }

      const draft = getDraft('estimation');
      if (draft && Object.keys(draft).length > 0) {
        const merged = {
          ...EMPTY_FORM,
          ...draft,
          estimation_date: formatDateForStorage(draft.estimation_date),
        };
        setForm(merged);
        bindForm(merged);
      }
    };

    hydrate();
  }, [currentWorkId]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = useCallback(
    (key, val, { immediate = false } = {}) => {
      setForm((prev) => {
        const updated = { ...prev, [key]: val };
        queueMicrotask(() => {
          setDraft('estimation', updated);
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
    'estimation',
    (workId, data) => {
      if (!workId) {
        throw new Error('Work ID not found. Please complete Work Details first.');
      }
      return upsertEstimation(workId, {
        estimate_done:   data.estimate_done,
        estimation_date: data.estimation_date,
        estimated_cost:  data.estimated_cost,
        notes:           data.notes,
        estimation_file_path: data.estimation_file_path,
      });
    },
    WORKFLOW_ROUTES.TENDER_CREATION,
    WORKFLOW_ROUTES.ESTIMATION,
  );

  const { pickDocument: pickEstimationFile, uploading: uploadingEstimationFile } =
    useDocumentUpload(
      currentWorkId,
      DOCUMENT_TYPES.ESTIMATION_FILE,
      (filePath) => updateField('estimation_file_path', filePath, { immediate: true }),
    );

  const handleSave = () => {
    saveAndContinue(form, navigation, {
      onValidationFail: (m) => Alert.alert('Save Failed', m),
    });
  };

  return (
    <ScreenLayout
      title="Estimation"
      showBack
      showNotification
      scrollable
      keyboardAware
      onBackPress={() => navigation.goBack()}
    >
      <WorkflowProgress
        currentStep={3}
        totalSteps={TOTAL_WORKFLOW_STEPS}
        showPercentage
        style={styles.progress}
      />
      <ProgressSlot
        step={3}
        title="Estimation"
        description="Confirm estimation status"
        screenType="estimation"
      />

      <View style={styles.form}>
        <FormToggleField
          label="Estimation done?"
          rowLabelOn="Estimation done"
          rowLabelOff="Estimation not done"
          value={form.estimate_done}
          onToggle={() =>
            updateField('estimate_done', !form.estimate_done, { immediate: true })
          }
        />

        {form.estimate_done && (
          <>
            <NativeDateField
              label="Estimation Date"
              value={form.estimation_date}
              onDateChange={(date) =>
                updateField('estimation_date', formatDateForStorage(date), { immediate: true })
              }
              placeholder="dd/mm/yyyy"
            />

            <Inputboxfield
              label="Estimated Cost (₹)"
              placeholder="Enter estimated cost"
              value={form.estimated_cost}
              onChangeText={(v) => updateField('estimated_cost', v)}
              keyboardType="numeric"
            />

            <Inputboxfield
              label="Notes"
              placeholder="Add notes (optional)"
              value={form.notes}
              onChangeText={(v) => updateField('notes', v)}
              multiline
              numberOfLines={2}
            />
          </>
        )}

        <UploadDocument
          sectionLabel="Documents"
          documents={[
            buildUploadDocumentEntry({
              title: 'Estimation file',
              uploadText: 'Upload estimation file',
              filePath: form.estimation_file_path,
              onPress: pickEstimationFile,
              loading: uploadingEstimationFile,
            }),
          ]}
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
  progress: { marginBottom: theme.Spacing?.sm ?? 8  },
  form:     { marginTop:    theme.Spacing?.sm ?? 8  },
  cta:      { marginTop:    theme.Spacing?.lg ?? 24, marginBottom: theme.Spacing?.xl ?? 32 },
});

export default EstimationScreen;
