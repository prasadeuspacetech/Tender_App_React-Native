// src/screens/AddWork/workflow/ContractorAssignmentScreen.jsx
// Step 6 of 10: Contractor Assignment

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

// ─── Layout ───────────────────────────────────────────────────────────────────
import ProgressSlot from '../../../components/layouts/Progressslot';
import ScreenLayout from '../../../components/layouts/Screenlayout';
import WorkflowProgress from '../../../components/layouts/Workflowprogress';

// ─── Form components ──────────────────────────────────────────────────────────
import DropdownModal from '../../../components/DropdownModal';
import Inputboxfield from '../../../components/Inputboxfield';
import PrimaryButton from '../../../components/PrimaryButton';
import UploadDocument from '../../../components/UploadDocument';
import { DOCUMENT_TYPES } from '../../../constants/documentTypes';
import useDocumentUpload from '../../../hooks/useDocumentUpload';
import { buildUploadDocumentEntry } from '../../../utils/documentUploadProps';

// ─── State & data ─────────────────────────────────────────────────────────────
import {
  getContractorByWorkId,
  mapContractorRowToForm,
  normalizeEstimateType,
  upsertContractorAssignment,
} from '../../../db/repositories/contractorRepository';
import { CONTRACTOR_ESTIMATE_OPTIONS } from '../../../constants/dropdownOptions';
import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
import useDraftStore from '../../../store/useDraftStore';
import useWorkStore from '../../../store/useWorkStore';

// ─── Constants ────────────────────────────────────────────────────────────────
import {
  TOTAL_WORKFLOW_STEPS,
  WORKFLOW_ROUTES,
} from '../../../constants/WorkflowSteps';

import theme from '../../../theme';

// ─── Validation ───────────────────────────────────────────────────────────────
const validate = (form) => {
  const errors = {};
  if (!form.contractor_name?.trim()) errors.contractor_name = 'Contractor name is required';
  return errors;
};

// ─── Initial form state ───────────────────────────────────────────────────────
// Persisted: contractor_name, contractor_contact, percentage_above_below,
//            percentage_variation, final_tender_amount
const EMPTY_FORM = {
  contractor_name: '',
  contractor_contact: '',
  percentage_above_below: 'above',
  percentage_variation: '',
  final_tender_amount: '',
  contractor_doc_path: '',
};

// ─────────────────────────────────────────────────────────────────────────────
const ContractorAssignmentScreen = ({ navigation }) => {
  useWorkflowStepGuard(WORKFLOW_ROUTES.CONTRACTOR_ASSIGNMENT, navigation);

  const { getDraft, setDraft } = useDraftStore();
  const { currentWorkId } = useWorkStore();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [directionModalVisible, setDirectionModalVisible] = useState(false);

  // ─── Hydrate: draft → SQLite ───────────────────────────────────────────────
  useEffect(() => {
    const hydrate = () => {
      const draft = getDraft('contractorAssignment');
      if (draft && Object.keys(draft).length > 0) {
        const legacyDirection = draft.percentage_above_below
          ?? (typeof draft.percentage_direction === 'string'
            ? draft.percentage_direction
            : draft.percentage_direction?.value);
        setForm({
          ...EMPTY_FORM,
          ...draft,
          percentage_above_below: normalizeEstimateType(legacyDirection),
        });
        return;
      }

      if (!currentWorkId) return;

      try {
        const row = getContractorByWorkId(currentWorkId);
        const hydrated = mapContractorRowToForm(row, EMPTY_FORM);
        if (!hydrated) return;

        setForm((prev) => ({ ...prev, ...hydrated }));
        queueMicrotask(() =>
          setDraft('contractorAssignment', { ...EMPTY_FORM, ...hydrated }),
        );
      } catch (e) {
        console.warn('[ContractorAssignment] hydration failed:', e);
      }
    };

    hydrate();
  }, [currentWorkId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Field updater ────────────────────────────────────────────────────────
  const updateField = useCallback((key, value) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      queueMicrotask(() => setDraft('contractorAssignment', updated));
      return updated;
    });
    if (errors[key]) {
      setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
    }
  }, [errors, setDraft]);

  // ─── Estimate direction dropdown (DropdownModal passes full option object) ───
  const handleSelectDirection = useCallback((option) => {
    updateField('percentage_above_below', option.value);
    setDirectionModalVisible(false);
  }, [updateField]);

  const displayDirection =
    CONTRACTOR_ESTIMATE_OPTIONS.find((o) => o.value === form.percentage_above_below)?.label
    ?? 'Above';

  // ─── Save & Continue ──────────────────────────────────────────────────────
  const { saveAndContinue, isSaving } = useSaveAndContinue(
    'contractorAssignment',
    (workId, data) => upsertContractorAssignment(workId, {
      contractor_name: data.contractor_name,
      contractor_contact: data.contractor_contact,
      percentage_above_below: data.percentage_above_below,
      percentage_variation: data.percentage_variation,
      final_tender_amount: data.final_tender_amount,
      contractor_doc_path: data.contractor_doc_path,
    }),
    WORKFLOW_ROUTES.SANCTION_APPROVAL,
    WORKFLOW_ROUTES.CONTRACTOR_ASSIGNMENT,
  );

  const { pickDocument: pickContractorDoc, uploading: uploadingContractorDoc } =
    useDocumentUpload(
      currentWorkId,
      DOCUMENT_TYPES.CONTRACTOR_DETAILS,
      (filePath) => updateField('contractor_doc_path', filePath),
    );

  const handleSave = () => {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    saveAndContinue(form, navigation, {
      onValidationFail: (msg) => Alert.alert('Save Failed', msg),
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ScreenLayout
      title="Contractor Assignment"
      showBack
      showNotification
      scrollable
      keyboardAware
      onBackPress={() => navigation.goBack()}
    >
      <WorkflowProgress
        currentStep={6}
        totalSteps={TOTAL_WORKFLOW_STEPS}
        showPercentage
        style={styles.progress}
      />

      <ProgressSlot
        step={6}
        title="Contractor Assignment"
        description="Assign contractor for the work"
        screenType="contractorAssignment"
      />

      <View style={styles.form}>

        {/* Contractor Name */}
        <Inputboxfield
          label="Contractor name"
          placeholder="Enter full name"
          value={form.contractor_name}
          onChangeText={(v) => updateField('contractor_name', v)}
          error={errors.contractor_name}
          required
        />

        {/* Contractor Contact */}
        <Inputboxfield
          label="Contractor contact"
          placeholder="+91 8833557722"
          value={form.contractor_contact}
          type="phone"
          keyboardType="phone-pad"
          onChangeText={(v) => updateField('contractor_contact', v)}
        />

        {/* % above / below estimate — side-by-side row */}
        <Text style={styles.rowLabel}>% above / below estimate</Text>
        <View style={styles.percentRow}>

          {/* Direction dropdown — compact left cell */}
          <View style={styles.directionCell}>
            <Inputboxfield
              placeholder="Above"
              value={displayDirection}
              type="dropdown"
              onPress={() => setDirectionModalVisible(true)}
              containerStyle={styles.noMargin}
              style={styles.directionInputWrapper}
              inputStyle={styles.directionInputText}
            />
          </View>

          {/* Percentage value — expands to fill remaining space */}
          <View style={styles.percentCell}>
            <Inputboxfield
              placeholder="0.00"
              value={form.percentage_variation}
              type="number"
              keyboardType="numeric"
              onChangeText={(v) => updateField('percentage_variation', v)}
              rightIcon={<Text style={styles.percentSuffix}>%</Text>}
              containerStyle={styles.noMargin}
            />
          </View>

        </View>

        {/* Final Tender Amount */}
        <Inputboxfield
          label="Final tender amount (₹)"
          placeholder="₹0.00"
          value={form.final_tender_amount}
          type="number"
          keyboardType="numeric"
          onChangeText={(v) => updateField('final_tender_amount', v)}
        />

        {/* ── Documents section ──────────────────────────────────────────── */}
        <UploadDocument
          sectionLabel="Documents"
          documents={[
            buildUploadDocumentEntry({
              title: 'Contractor details',
              uploadText: 'Upload Contractor details',
              filePath: form.contractor_doc_path,
              onPress: pickContractorDoc,
              loading: uploadingContractorDoc,
            }),
          ]}
        />

      </View>

      <PrimaryButton
        title="Save & Continue"
        onPress={handleSave}
        loading={isSaving}
        fullWidth
        style={styles.cta}
      />

      {/* Direction dropdown modal */}
      <DropdownModal
        visible={directionModalVisible}
        title="Select Direction"
        options={CONTRACTOR_ESTIMATE_OPTIONS}
        selectedValue={form.percentage_above_below}
        onSelect={handleSelectDirection}
        onClose={() => setDirectionModalVisible(false)}
      />

    </ScreenLayout>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  progress: { marginBottom: theme.Spacing?.sm ?? 8 },
  form: { marginTop: theme.Spacing?.sm ?? 8 },
  cta: { marginTop: theme.Spacing?.lg ?? 24, marginBottom: theme.Spacing?.xl ?? 32 },

  // ── % above/below row ──────────────────────────────────────────────────────
  rowLabel: {
    fontSize: theme.FontSize?.sm ?? 14,
    fontWeight: theme.FontWeight?.medium ?? '500',
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: theme.Colors?.textPrimary ?? '#1A1A1A',
    marginBottom: theme.Spacing?.xs ?? 6,
    letterSpacing: 0.1,
  },
  percentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.Spacing?.sm ?? 8,
    marginBottom: theme.Spacing?.md ?? 14,
  },
  // Wide enough for "Below" + chevron without clipping (110px was too narrow)
  directionCell: {
    minWidth: 124,
    width: '36%',
    maxWidth: 148,
  },
  directionInputWrapper: {
    paddingHorizontal: 12,
  },
  directionInputText: {
    flex: 1,
    minWidth: 0,
  },
  // Percentage input — takes remaining width
  percentCell: {
    flex: 1,
  },
  noMargin: {
    marginBottom: 0,   // row handles its own bottom margin
  },
  percentSuffix: {
    fontSize: theme.FontSize?.sm ?? 14,
    color: theme.Colors?.textTertiary ?? '#888888',
    fontWeight: theme.FontWeight?.medium ?? '500',
  },

});

export default ContractorAssignmentScreen;