// src/screens/AddWork/workflow/PmcApprovalScreen.jsx
// Step 2 of 10: PMC Approval

import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

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
  getApprovalByWorkId,
  mapApprovalRowToForm,
  upsertApprovalDetails,
} from '../../../db/repositories/approvalsRepository';
import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowAutoSave from '../../../hooks/useWorkflowAutoSave';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
import useDraftStore from '../../../store/useDraftStore';
import useWorkStore from '../../../store/useWorkStore';
import theme from '../../../theme';
import { formatDateForStorage } from '../../../utils/dateFormat';

import FormToggleField from '../../../components/FormToggleField';

const EMPTY_FORM = {
  letter_number: '',
  letter_date: '',
  approval_date: '',
  finance_committee: false,
  finance_approval_status: '',
  pmc_letter_path: '',
};

const PmcApprovalScreen = ({ navigation }) => {
  useWorkflowStepGuard(WORKFLOW_ROUTES.PMC_APPROVAL, navigation);

  const getDraft = useDraftStore((s) => s.getDraft);
  const setDraft = useDraftStore((s) => s.setDraft);
  const { currentWorkId } = useWorkStore();

  const [form, setForm] = useState(EMPTY_FORM);
  const { bindForm, scheduleDebouncedSave, saveImmediately } = useWorkflowAutoSave('pmcApproval');

  useEffect(() => {
    bindForm(form);
  }, [form, bindForm]);

  const loadPmcForm = useCallback(() => {
    if (currentWorkId) {
      try {
        const row = getApprovalByWorkId(currentWorkId);
        const hydrated = mapApprovalRowToForm(row);
        if (hydrated) {
          setForm(hydrated);
          bindForm(hydrated);
          queueMicrotask(() => setDraft('pmcApproval', hydrated));
          return;
        }
      } catch (e) {
        console.warn('[PmcApprovalScreen] hydration failed:', e);
      }
    }

    const draft = getDraft('pmcApproval');
    if (draft && Object.keys(draft).length > 0) {
      const merged = {
        ...EMPTY_FORM,
        ...draft,
        letter_date: formatDateForStorage(draft.letter_date),
        approval_date: formatDateForStorage(draft.approval_date),
      };
      setForm(merged);
      bindForm(merged);
    }
  }, [currentWorkId, getDraft, setDraft, bindForm]);

  useFocusEffect(
    useCallback(() => {
      loadPmcForm();
    }, [loadPmcForm]),
  );

  const updateField = useCallback(
    (key, val, { immediate = false } = {}) => {
      setForm((prev) => {
        const updated = { ...prev, [key]: val };
        queueMicrotask(() => {
          setDraft('pmcApproval', updated);
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
    'pmcApproval',
    (workId, data) => upsertApprovalDetails(workId, {
      letter_number: data.letter_number,
      letter_date: formatDateForStorage(data.letter_date),
      approval_date: formatDateForStorage(data.approval_date),
      finance_required: data.finance_committee,
      finance_status: data.finance_approval_status,
      pmc_letter_path: data.pmc_letter_path,
    }),
    WORKFLOW_ROUTES.ESTIMATION,
    WORKFLOW_ROUTES.PMC_APPROVAL,
  );

  const { pickDocument: pickPmcLetter, uploading: uploadingPmcLetter } = useDocumentUpload(
    currentWorkId,
    DOCUMENT_TYPES.PMC_LETTER,
    (filePath) => updateField('pmc_letter_path', filePath, { immediate: true }),
  );

  const handleSave = () => {
    saveAndContinue(form, navigation, {
      onValidationFail: (m) => Alert.alert('Save Failed', m),
    });
  };

  return (
      <ScreenLayout
        title="PMC Approval"
        showBack
        showNotification
        scrollable
        keyboardAware
        onBackPress={() => navigation.goBack()}
      >
        <WorkflowProgress
          currentStep={2}
          totalSteps={TOTAL_WORKFLOW_STEPS}
          showPercentage
          style={styles.progress}
        />
        <ProgressSlot
          step={2}
          title="PMC Approval"
          description="Upload PMC letter and get approval"
          screenType="pmcApproval"
        />

        <View style={styles.form}>
          <Inputboxfield
            label="Letter Number"
            placeholder="eg. ERK-2025-0001"
            value={form.letter_number}
            onChangeText={(v) => updateField('letter_number', v)}
          />

          <NativeDateField
            label="Letter Date"
            value={form.letter_date}
            onDateChange={(date) =>
              updateField('letter_date', formatDateForStorage(date), { immediate: true })
            }
            placeholder="dd/mm/yyyy"
          />

          <NativeDateField
            label="Approval Date"
            value={form.approval_date}
            onDateChange={(date) =>
              updateField('approval_date', formatDateForStorage(date), { immediate: true })
            }
            placeholder="dd/mm/yyyy"
          />

          <FormToggleField
            label="Finance Committee"
            rowLabelOn="Finance committee required"
            rowLabelOff="Finance committee not required"
            value={form.finance_committee}
            onToggle={() =>
              updateField('finance_committee', !form.finance_committee, { immediate: true })
            }
          />

          {form.finance_committee ? (
            <Inputboxfield
              label="Finance Approval Status"
              placeholder="e.g. Pending, Approved, Rejected"
              value={form.finance_approval_status}
              onChangeText={(v) => updateField('finance_approval_status', v)}
            />
          ) : null}

          <UploadDocument
            sectionLabel="Documents"
            documents={[
              buildUploadDocumentEntry({
                title: 'PMC Letter PDF',
                uploadText: 'Upload PMC Letter PDF',
                filePath: form.pmc_letter_path,
                onPress: pickPmcLetter,
                loading: uploadingPmcLetter,
                showUploadAction: true,
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
  progress: { marginBottom: theme.Spacing?.sm ?? 8 },
  form:     { marginTop:    theme.Spacing?.sm ?? 8 },
  cta:      { marginTop: theme.Spacing?.lg ?? 24, marginBottom: theme.Spacing?.xl ?? 32 },

});

export default PmcApprovalScreen;
