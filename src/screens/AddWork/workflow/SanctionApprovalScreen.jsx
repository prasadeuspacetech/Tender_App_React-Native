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

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

import ScreenLayout     from '../../../components/layouts/Screenlayout';
import WorkflowProgress from '../../../components/layouts/Workflowprogress';
import ProgressSlot     from '../../../components/layouts/Progressslot';
import Inputboxfield    from '../../../components/Inputboxfield';
import CalendarPicker   from '../../../components/CalendarPicker';
import UploadDocument from '../../../components/UploadDocument';
import { DOCUMENT_TYPES } from '../../../constants/documentTypes';
import useDocumentUpload from '../../../hooks/useDocumentUpload';
import { buildUploadDocumentEntry } from '../../../utils/documentUploadProps';
import PrimaryButton    from '../../../components/PrimaryButton';

import useDraftStore      from '../../../store/useDraftStore';
import useWorkStore       from '../../../store/useWorkStore';
import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';

import {
  upsertSanction,
  getSanctionByWorkId,
  mapSanctionRowToForm,
} from '../../../db/repositories/sanctionsRepository';
import { formatDateForStorage } from '../../../utils/dateFormat';
import { WORKFLOW_ROUTES, TOTAL_WORKFLOW_STEPS } from '../../../constants/WorkflowSteps';
import theme from '../../../theme';

// ─── Initial form state ───────────────────────────────────────────────────────
const EMPTY_FORM = {
  docket_number:        '',
  sanction_amount:      '',
  sanction_date:        '',
  sanction_letter_path: '',
};

// ─── Validation ───────────────────────────────────────────────────────────────
// str() coerces any value to string safely before .trim().
// Required because Hermes (Android JS engine) can throw when optional chaining
// is used with .trim() on values that are non-string at runtime (e.g. undefined
// coming from CalendarPicker before a date is picked).
const str = (v) => (v == null ? '' : String(v));

const validate = (form) => {
  const errors = {};
  if (!str(form.docket_number).trim())   errors.docket_number   = 'Docket number is required';
  if (!str(form.sanction_amount).trim()) errors.sanction_amount = 'Sanction amount is required';
  if (!str(form.sanction_date).trim())   errors.sanction_date   = 'Sanction date is required';
  return errors;
};

// ─────────────────────────────────────────────────────────────────────────────
const SanctionApprovalScreen = ({ navigation }) => {
  useWorkflowStepGuard(WORKFLOW_ROUTES.SANCTION_APPROVAL, navigation);

  const { getDraft, setDraft } = useDraftStore();
  const { currentWorkId }  = useWorkStore();

  const [form,   setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // ── Hydration: draft → SQLite ─────────────────────────────────────────────
  useEffect(() => {
    const hydrate = () => {
      const draft = getDraft('sanctionApproval');
      if (draft && Object.keys(draft).length > 0) {
        setForm((prev) => ({
          ...prev,
          ...draft,
          sanction_date: formatDateForStorage(draft.sanction_date),
        }));
        return;
      }

      if (!currentWorkId) return;

      try {
        const row = getSanctionByWorkId(currentWorkId);
        const hydrated = mapSanctionRowToForm(row);
        if (!hydrated) return;

        setForm(hydrated);
        queueMicrotask(() => setDraft('sanctionApproval', hydrated));
      } catch (e) {
        console.warn('[SanctionApproval] hydration error:', e);
      }
    };

    hydrate();
  }, [currentWorkId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Field update ───────────────────────────────────────────────────────────
  const updateField = (key, val) => {
    const updated = { ...form, [key]: val };
    setForm(updated);
    setDraft('sanctionApproval', updated);
    if (errors[key]) {
      setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
    }
  };

  // ── Save & Continue ────────────────────────────────────────────────────────
  const { saveAndContinue, isSaving } = useSaveAndContinue(
    'sanctionApproval',
    (workId, data) => upsertSanction(workId, data),
    WORKFLOW_ROUTES.PAYMENT_STATUS,
    WORKFLOW_ROUTES.SANCTION_APPROVAL,
  );

  const { pickDocument: pickSanctionLetter, uploading: uploadingSanctionLetter } =
    useDocumentUpload(
      currentWorkId,
      DOCUMENT_TYPES.SANCTION_LETTER,
      (filePath) => updateField('sanction_letter_path', filePath),
    );

  const handleSave = () => {
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
          value={form.docket_number}
          onChangeText={(v) => updateField('docket_number', v)}
          error={errors.docket_number}
          required
        />

        {/* Sanction Amount — numeric, ₹ prefix */}
        <Inputboxfield
          label="Sanction amount (₹)"
          placeholder="₹0.00"
          value={form.sanction_amount}
          onChangeText={(v) => updateField('sanction_amount', v)}
          keyboardType="decimal-pad"
          error={errors.sanction_amount}
          required
        />

        {/* Sanction Date — inline CalendarPicker, no modal */}
        <CalendarPicker
          label="Sanction date"
          placeholder="dd/mm/yy"
          value={form.sanction_date}
          onDateChange={(v) => updateField('sanction_date', formatDateForStorage(v))}
          error={errors.sanction_date}
          required
        />

        {/* ── Documents section ────────────────────────────────────────── */}
        <UploadDocument
          sectionLabel="Documents"
          documents={[
            buildUploadDocumentEntry({
              title: 'Sanction letter',
              uploadText: 'Upload Sanction letter',
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