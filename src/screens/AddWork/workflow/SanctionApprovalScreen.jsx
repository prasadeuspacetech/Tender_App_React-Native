// src/screens/AddWork/workflow/SanctionApprovalScreen.jsx
// Step 7 of 10: Sanction Approval
//
// Changes from stub:
//   + sanction_amount field (₹, numeric keyboard)
//   + CalendarPicker replacing plain Inputboxfield for sanction_date
//   + Documents section (Sanction letter + UploadDocument)
//   + Hydration on mount via getSanctionByWorkId
//   + Real upsertSanction wired to useSaveAndContinue (stub removed)
//   + Validation for required fields

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

import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowAutoSave from '../../../hooks/useWorkflowAutoSave';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
import useDraftStore from '../../../store/useDraftStore';
import useWorkStore from '../../../store/useWorkStore';

import { TOTAL_WORKFLOW_STEPS, WORKFLOW_ROUTES } from '../../../constants/WorkflowSteps';
import {
    getSanctionByWorkId,
    mapSanctionRowToForm,
    upsertSanction,
} from '../../../db/repositories/sanctionsRepository';
import theme from '../../../theme';
import { formatDateForStorage } from '../../../utils/dateFormat';

// ─── Initial form state ───────────────────────────────────────────────────────
const EMPTY_FORM = {
  docket_number:        '',
  sanction_date:        '',
  sanction_amount:      '',
  sanction_authority:   '',
  sanction_letter_path: '',
};

// ─────────────────────────────────────────────────────────────────────────────
const SanctionApprovalScreen = ({ navigation }) => {
  useWorkflowStepGuard(WORKFLOW_ROUTES.SANCTION_APPROVAL, navigation);

  const getDraft = useDraftStore((s) => s.getDraft);
  const setDraft = useDraftStore((s) => s.setDraft);
  const { currentWorkId }  = useWorkStore();

  const [form, setForm] = useState(EMPTY_FORM);
  const { bindForm, scheduleDebouncedSave, saveImmediately } = useWorkflowAutoSave('sanctionApproval');

  useEffect(() => {
    bindForm(form);
  }, [form, bindForm]);

  useEffect(() => {
    const hydrate = () => {
      if (currentWorkId) {
        try {
          const row = getSanctionByWorkId(currentWorkId);
          const hydrated = mapSanctionRowToForm(row);
          if (hydrated) {
            setForm(hydrated);
            bindForm(hydrated);
            queueMicrotask(() => setDraft('sanctionApproval', hydrated));
            return;
          }
        } catch (e) {
          console.warn('[SanctionApproval] hydration error:', e);
        }
      }

      const draft = getDraft('sanctionApproval');
      if (draft && Object.keys(draft).length > 0) {
        const merged = {
          ...EMPTY_FORM,
          ...draft,
          sanction_date: formatDateForStorage(draft.sanction_date),
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
          setDraft('sanctionApproval', updated);
          bindForm(updated);
          if (immediate) saveImmediately();
          else scheduleDebouncedSave();
        });
        return updated;
      });
    },
    [setDraft, bindForm, scheduleDebouncedSave, saveImmediately],
  );

  // ── Save & Continue ────────────────────────────────────────────────────────
  const { saveAndContinue, isSaving } = useSaveAndContinue(
    'sanctionApproval',
    (workId, data) => upsertSanction(workId, data),
    WORKFLOW_ROUTES.WORK_ORDER,
    WORKFLOW_ROUTES.SANCTION_APPROVAL,
  );

  const { pickDocument: pickSanctionLetter, uploading: uploadingSanctionLetter } =
    useDocumentUpload(
      currentWorkId,
      DOCUMENT_TYPES.SANCTION_LETTER,
      (filePath) => updateField('sanction_letter_path', filePath, { immediate: true }),
    );

  const handleSave = () => {
    saveAndContinue(form, navigation, {
      onValidationFail: (m) => Alert.alert('Save Failed', m),
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ScreenLayout
      title="Sanction Approval"
      showBack
      showNotification
      scrollable
      keyboardAware
      onBackPress={() => navigation.goBack()}
    >
      <WorkflowProgress
        currentStep={7}
        totalSteps={TOTAL_WORKFLOW_STEPS}
        showPercentage
        style={styles.progress}
      />
      <ProgressSlot
        step={7}
        title="Sanction Approval"
        description="Get sanction approval for work order"
        screenType="sanctionApproval"
      />

      <View style={styles.form}>

        {/* Docket Number */}
        <Inputboxfield
          label="Docket number"
          placeholder="DKT 005-2035"
          type="alphanumeric"
          value={form.docket_number}
          onChangeText={(v) => updateField('docket_number', v)}
        />

        <NativeDateField
          label="Sanction date"
          placeholder="dd/mm/yy"
          value={form.sanction_date}
          onDateChange={(v) =>
            updateField('sanction_date', formatDateForStorage(v), { immediate: true })
          }
        />

        <Inputboxfield
          label="Sanction amount (₹)"
          placeholder="₹0.00"
          type="number"
          value={form.sanction_amount}
          onChangeText={(v) => updateField('sanction_amount', v)}
          keyboardType="decimal-pad"
        />

        <Inputboxfield
          label="Sanction Authority"
          placeholder="Enter sanction authority"
          value={form.sanction_authority}
          onChangeText={(v) => updateField('sanction_authority', v)}
        />

        {/* ── Documents section ────────────────────────────────────────── */}
        <UploadDocument
          sectionLabel="Documents"
          documents={[
            buildUploadDocumentEntry({
              title: 'Sanction letter',
              uploadText: 'Upload resolution/Sanction letter',
              filePath: form.sanction_letter_path,
              onPress: pickSanctionLetter,
              loading: uploadingSanctionLetter,
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  progress: { marginBottom: theme.Spacing?.sm ?? 8  },
  form:     { marginTop:    theme.Spacing?.sm ?? 8  },
  cta:      { marginTop: theme.Spacing?.lg ?? 24, marginBottom: theme.Spacing?.xl ?? 32 },

});

export default SanctionApprovalScreen;