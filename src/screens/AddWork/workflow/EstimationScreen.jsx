// src/screens/AddWork/workflow/EstimationScreen.jsx
// Step 3 of 9: Estimation

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

import ScreenLayout      from '../../../components/layouts/Screenlayout';
import WorkflowProgress  from '../../../components/layouts/Workflowprogress';
import ProgressSlot      from '../../../components/layouts/Progressslot';
import UploadDocument from '../../../components/UploadDocument';
import { DOCUMENT_TYPES } from '../../../constants/documentTypes';
import useDocumentUpload from '../../../hooks/useDocumentUpload';
import { buildUploadDocumentEntry } from '../../../utils/documentUploadProps';
import FormToggleField from '../../../components/FormToggleField';
import { formFieldStyles } from '../../../theme/formFieldStyles';
import Inputboxfield     from '../../../components/Inputboxfield';
import PrimaryButton     from '../../../components/PrimaryButton';
import CalendarPicker    from '../../../components/CalendarPicker';

import useDraftStore      from '../../../store/useDraftStore';
import useWorkStore       from '../../../store/useWorkStore';
import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
import {
  upsertEstimation,
  getEstimationByWorkId,
  mapEstimationRowToForm,
} from '../../../db/repositories/estimationsRepository';
import { formatDateForStorage } from '../../../utils/dateFormat';
import { WORKFLOW_ROUTES, TOTAL_WORKFLOW_STEPS } from '../../../constants/WorkflowSteps';
import theme from '../../../theme';

const EMPTY_FORM = {
  estimate_done:    false,
  estimation_date:  '',
  estimated_cost:   '',
  notes:            '',
  estimation_file_path: '',
};

const validate = (form) => {
  const errors = {};
  if (form.estimate_done) {
    if (!form.estimation_date)        errors.estimation_date = 'Estimation date is required';
    if (!form.estimated_cost?.trim()) errors.estimated_cost = 'Estimated cost is required';
  }
  return errors;
};

const EstimationScreen = ({ navigation }) => {
  useWorkflowStepGuard(WORKFLOW_ROUTES.ESTIMATION, navigation);

  const { getDraft, setDraft } = useDraftStore();
  const { currentWorkId } = useWorkStore();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const hydrate = () => {
      const draft = getDraft('estimation');
      if (draft && Object.keys(draft).length > 0) {
        setForm((prev) => ({
          ...prev,
          ...draft,
          estimation_date: formatDateForStorage(draft.estimation_date),
        }));
        return;
      }

      if (!currentWorkId) return;

      try {
        const row = getEstimationByWorkId(currentWorkId);
        const hydrated = mapEstimationRowToForm(row);
        if (!hydrated) return;

        setForm(hydrated);
        setDraft('estimation', hydrated);
      } catch (e) {
        console.warn('[EstimationScreen] hydration failed:', e);
      }
    };

    hydrate();
  }, [currentWorkId]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = useCallback((key, val) => {
    const updated = { ...form, [key]: val };
    setForm(updated);
    setDraft('estimation', updated);
    if (errors[key]) {
      setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
    }
  }, [form, errors, setDraft]);

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
      (filePath) => updateField('estimation_file_path', filePath),
    );

  const handleSave = () => {
    if (!currentWorkId) {
      Alert.alert('Error', 'Work ID not found. Please restart from Work Details.');
      return;
    }

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
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
          rowLabel="Estimation done"
          value={form.estimate_done}
          onToggle={() => updateField('estimate_done', !form.estimate_done)}
        />

        {form.estimate_done && (
          <>
            <View>
              <CalendarPicker
                label="Estimation Date"
                value={form.estimation_date}
                onDateChange={(date) => updateField('estimation_date', formatDateForStorage(date))}
                placeholder="dd/mm/yyyy"
              />
              {errors.estimation_date ? (
                <Text style={formFieldStyles.errorText}>{errors.estimation_date}</Text>
              ) : null}
            </View>

            <Inputboxfield
              label="Estimated Cost (₹)"
              placeholder="Enter estimated cost"
              value={form.estimated_cost}
              onChangeText={(v) => updateField('estimated_cost', v)}
              keyboardType="numeric"
              error={errors.estimated_cost}
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
